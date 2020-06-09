const updatePartyItems = async (models, partyId, mediaItemId) => {
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

const insertNewMediaItem = async (req, newMediaItem, models, logger) => {
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

export default { updatePartyItems, insertNewMediaItem };
