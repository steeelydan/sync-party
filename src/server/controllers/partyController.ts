import { newPartyValidator, partyValidator } from '../../shared/validation.js';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { createWebRtcIds } from '../serverHelpers.js';
import { Models, NewParty } from '../../shared/types.js';

/**
 * @api {post} /api/party Create New Party (Admin only)
 * @apiName createParty
 * @apiGroup partyController
 * @apiDescription Creates a new party
 * @apiPermission admin
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {String} partyName Name for the new party.
 * @apiSuccess createPartySuccessful Party was created successfully.
 * @apiError partyWithSameName A party with that name already exists.
 * @apiError notAuthorized Requesting user is not admin.
 */
const createParty = async (
    req: Request,
    res: Response,
    models: Models,
    logger: Logger
) => {
    const requestUser = req.user;

    if (req.body.partyName !== '' && requestUser && requestUser.id) {
        try {
            const newParty: NewParty = {
                owner: requestUser.id,
                name: req.body.partyName,
                status: 'active',
                members: [requestUser.id],
                items: [],
                metadata: {},
                settings: {
                    webRtcIds: createWebRtcIds([requestUser.id])
                }
            };

            if (newPartyValidator.validate(newParty).error) {
                logger.log(
                    'info',
                    `Validation error while creating new party: ${JSON.stringify(
                        newPartyValidator.validate(newParty).error
                    )}`
                );

                return res
                    .status(400)
                    .json({ success: false, msg: 'validationError' });
            }

            const partyWithSameName = await models.Party.findOne({
                where: { name: req.body.partyName }
            });

            if (!partyWithSameName) {
                await models.Party.create(newParty);

                return res.status(200).json({
                    success: true,
                    msg: 'createPartySuccessful'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    msg: 'partyWithSameName'
                });
            }
        } catch (error) {
            logger.log('error', error);

            return Promise.reject();
        }
    } else {
        return res.status(400).json({
            success: true,
            msg: 'missingFields'
        });
    }
};

/**
 * @api {put} /api/party Edit Party (Admin only)
 * @apiName editParty
 * @apiGroup partyController
 * @apiDescription Edits a party. Possibilities: Change party status; add member; remove member; delete party.
 * @apiPermission admin
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {Boolean} deleteParty Party is up for deletion.
 * @apiParam {Object} party Edited party.
 * @apiSuccess partyEditSuccessful Party was edited successfully.
 * @apiError notAuthorized Requesting user is not admin.
 */
const editParty = async (
    req: Request,
    res: Response,
    models: Models,
    logger: Logger
) => {
    const deleteParty = req.body.deleteParty;

    const requestParty = req.body.party;

    const dbParty = await models.Party.findOne({
        where: { id: requestParty.id }
    });

    // Recreate webRtcIds if party status changes
    if (dbParty.status !== requestParty.status) {
        requestParty.settings = {
            ...requestParty.settings,
            webRtcIds: createWebRtcIds(requestParty.members)
        };
    }

    if (dbParty.members.length !== requestParty.members.length) {
        if (!requestParty.settings.webRtcIds) {
            // Legacy: create webRtcIds if there are none
            requestParty.settings.webRtcIds = createWebRtcIds(
                requestParty.members
            );
        }

        // Generate a webRtcId if there is new member
        requestParty.members.forEach((member: string) => {
            if (!dbParty.members.includes(member)) {
                requestParty.settings.webRtcIds = {
                    ...requestParty.settings.webRtcIds,
                    [member]: uuid()
                };
            }
        });

        // Delete webRtcId if member is removed
        dbParty.members.forEach((member: string) => {
            if (!requestParty.members.includes(member)) {
                const newWebRtcIds = { ...requestParty.settings.webRtcIds };
                delete newWebRtcIds[member];
                requestParty.settings.webRtcIds = newWebRtcIds;
            }
        });
    }

    if (partyValidator.validate(requestParty).error) {
        logger.log(
            'info',
            `Validation error while editing party: ${JSON.stringify(
                partyValidator.validate(requestParty).error
            )}`
        );

        return res.status(400).json({ success: false, msg: 'validationError' });
    }

    try {
        if (deleteParty) {
            dbParty.destroy();
        } else {
            dbParty.status = requestParty.status;
            dbParty.members = requestParty.members;
            dbParty.settings = requestParty.settings;
            dbParty.save();
        }

        return res.status(200).json({
            success: true,
            msg: 'partyEditSuccessful'
        });
    } catch (error) {
        logger.log('error', error);

        return Promise.reject();
    }
};

export default { createParty, editParty };
