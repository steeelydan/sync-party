import { Party } from '../models/Party.js';
import { MediaItem } from '../models/MediaItem.js';

import type { Request } from 'express';
import type { Logger } from 'winston';
import type { CreationAttributes } from 'sequelize';

const updatePartyItems = async (partyId: string, mediaItemId: string) => {
    const party = await Party.findOne({ where: { id: partyId } });

    if (!party) {
        return Promise.reject('Party not found: ' + partyId);
    }

    const newPartyItems = [...party.items];
    if (!newPartyItems.includes(mediaItemId)) {
        newPartyItems.push(mediaItemId);
        party.items = newPartyItems;
        party.save();

        return Promise.resolve();
    } else {
        return Promise.reject(new Error('Item already in party'));
    }
};

const insertNewMediaItem = async (
    req: Request,
    newMediaItem: CreationAttributes<MediaItem>,
    logger: Logger
) => {
    const requestPartyId = req.body.partyId;

    const requestParty = await Party.findOne({
        where: { id: requestPartyId }
    });

    if (
        requestParty &&
        req.user &&
        req.user.id === newMediaItem.owner &&
        requestParty.members.includes(req.user.id) &&
        newMediaItem.name !== '' &&
        newMediaItem.url !== '' &&
        (requestParty.status === 'active' || req.user.role === 'admin')
    ) {
        try {
            const dbMediaItem = await MediaItem.create(newMediaItem);
            await updatePartyItems(requestParty.id, dbMediaItem.id);

            return Promise.resolve(true);
        } catch (error) {
            logger.log('error', error);

            return Promise.reject();
        }
    } else {
        logger.log('error', 'error creating new mediaItem');

        return Promise.reject();
    }
};

export { updatePartyItems, insertNewMediaItem };
