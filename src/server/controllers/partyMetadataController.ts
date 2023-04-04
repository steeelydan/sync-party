import { partyMetadataValidator } from '../../shared/validation.js';
import { Party } from '../models/Party.js';

import type { Logger } from 'winston';
import type { Request, Response } from 'express';

/**
 * @api {put} /api/partyMetadata Update Party Metadata
 * @apiName updatePartyMetadata
 * @apiGroup partyMetadataController
 * @apiDescription Update Party Metadata (played state only atm).
 * @apiPermission user
 * @apiHeader {String} cookie Express session cookie 'connect.sid' (checked by passport.js middleware)
 * @apiParam {Object} metadata New party metadata.
 * @apiParam {String} partyId ID of the party.
 * @apiSuccess metadataUpdateSuccessful Metadata was updated successfully.
 * @apiError notAuthorized Requesting user is not a member of the party / not admin or party is not active.
 */
const updatePartyMetadata = async (
    req: Request,
    res: Response,
    logger: Logger
) => {
    const requestUser = req.user;
    const partyId = req.body.partyId;
    const updatedMetadata = req.body.metadata;

    if (partyMetadataValidator.validate(updatedMetadata).error) {
        logger.log(
            'info',
            `Validation error while submitting metadata: ${JSON.stringify(
                partyMetadataValidator.validate(updatedMetadata).error
            )}`
        );

        return res.status(400).json({ success: false, msg: 'validationError' });
    }

    const party = await Party.findOne({ where: { id: partyId } });

    if (!party) {
        return res.status(500).json({ success: false, msg: 'Party not found' });
    }

    if (
        requestUser &&
        party.members.includes(requestUser.id) &&
        (party.status === 'active' || requestUser.role === 'admin')
    ) {
        try {
            party.metadata = { ...party.metadata, ...updatedMetadata };
            party.save();

            return res.status(200).json({
                success: true,
                msg: 'metadataUpdateSuccessful'
            });
        } catch (error) {
            logger.log('error', error);

            return Promise.reject();
        }
    } else {
        return res.status(403).json({
            success: false,
            msg: 'notAuthorized'
        });
    }
};

export default { updatePartyMetadata };
