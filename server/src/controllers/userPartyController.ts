import { Op } from 'sequelize';
import { Request, Response } from 'express';

/**
 * @api {get} /api/userParties Get All User Parties
 * @apiName getUserParties
 * @apiGroup userPartyController
 * @apiDescription Return parties the user is member in. Used all the time, e.g. when party is updated. Same result for admin or users. Parties are formatted: Some information about the other users is added etc.
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiSuccess {Object[]} userParties All media items.
 */
const getUserParties = async (req: Request, res: Response, models: Models) => {
    const allParties = await models.Party.findAll();

    // Restrict parties to those where given user is member
    const userParties = allParties.filter((party: Party) => {
        return party.members.includes(req.user.id);
    });

    // Get lists of ALL users & items of bespoke parties (later assigned to specific party)
    const userPartiesMemberList: string[] = [];
    const userPartiesItemList: string[] = [];

    userParties.forEach((userParty: Party) => {
        userParty.members.forEach((member) => {
            if (!userPartiesMemberList.includes(member)) {
                userPartiesMemberList.push(member);
            }
        });

        userParty.items.forEach((item) => {
            if (!userPartiesItemList.includes(item)) {
                userPartiesItemList.push(item);
            }
        });
    });

    // Get all formatted users (only id & username) & complete items for all parties this user is member of

    const userPartiesMembers: AppUser[] = await models.User.findAll({
        attributes: ['id', 'username'],
        where: {
            id: {
                [Op.in]: userPartiesMemberList
            }
        }
    });

    const userPartiesItems: MediaItem[] = await models.MediaItem.findAll({
        where: {
            id: {
                [Op.in]: userPartiesItemList
            }
        }
    });

    // Create final user parties array with respective members & items
    const formattedUserParties = userParties.map((userParty: Party) => {
        return {
            id: userParty.id,
            owner: userParty.owner,
            name: userParty.name,
            status: userParty.status,
            members: userPartiesMembers.filter((member: PartyMember) => {
                return userParty.members.includes(member.id);
            }),
            items: userParty.items
                .filter((itemId: string) =>
                    userPartiesItems.find(
                        (item: MediaItem) => item.id === itemId
                    )
                )
                .map((itemId) => {
                    return userPartiesItems.find(
                        (item: MediaItem) => item.id === itemId
                    );
                }),
            metadata: userParty.metadata || {},
            settings: userParty.settings || {}
        };
    });

    return res.status(200).json({
        success: true,
        msg: '',
        userParties: formattedUserParties
    });
};

export default { getUserParties };
