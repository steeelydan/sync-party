import { Op } from 'sequelize';
import { Party } from '../models/Party.js';
import { User } from '../models/User.js';
import { MediaItem } from '../models/MediaItem.js';

import type { Request, Response } from 'express';
import type { PartyMember } from '../../shared/types.js';

/**
 * @api {get} /api/userParties Get All User Parties
 * @apiName getUserParties
 * @apiGroup userPartyController
 * @apiDescription Return parties the user is member in. Used all the time, e.g. when party is updated. Same result for admin or users. Parties are formatted: Some information about the other users is added etc.
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiSuccess {Object[]} userParties All media items.
 */
const getUserParties = async (req: Request, res: Response) => {
    const requestUser = req.user;

    if (requestUser && requestUser.id) {
        const allParties = await Party.findAll();

        // Restrict parties to those where given user is member
        const userParties = allParties.filter((party: Party) => {
            return party.members.includes(requestUser.id);
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

        const userPartiesMembers = await User.findAll({
            attributes: ['id', 'username'],
            where: {
                id: {
                    [Op.in]: userPartiesMemberList
                }
            }
        });

        const userPartiesItems = await MediaItem.findAll({
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
                        userPartiesItems.find((item) => item.id === itemId)
                    )
                    .map((itemId) => {
                        return userPartiesItems.find(
                            (item) => item.id === itemId
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
    } else {
        return res.status(400).json({ success: false });
    }
};

export default { getUserParties };
