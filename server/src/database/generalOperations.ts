import { Request } from 'express';
import { Logger } from 'winston';

// FIXME types
const updatePartyItems = async (
    models: any,
    partyId: string,
    mediaItemId: string
) => {
    const party = await models.Party.findOne({ where: { id: partyId } });
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
    newMediaItem: any,
    // FIXME type
    models: any,
    logger: Logger
) => {
    const requestPartyId = req.body.partyId;

    const requestParty = await models.Party.findOne({
        where: { id: requestPartyId }
    });

    if (
        requestParty &&
        req.user.id === newMediaItem.owner &&
        requestParty.members.includes(req.user.id) &&
        newMediaItem.name !== '' &&
        newMediaItem.url !== '' &&
        (requestParty.status === 'active' || req.user.role === 'admin')
    ) {
        try {
            const dbMediaItem = await models.MediaItem.create(newMediaItem);
            await updatePartyItems(models, requestParty.id, dbMediaItem.id);
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
