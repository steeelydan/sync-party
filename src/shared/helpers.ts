import path from 'path';
import { v4 as uuid } from 'uuid';

const getFilePathFromId = (dbMediaItemId: string): string => {
    return path.join(path.resolve('data/uploads'), dbMediaItemId);
};

const createWebRtcIds = (userIds: string[]) => {
    const webRtcIds: { [userId: string]: string } = {};
    userIds.forEach((userId) => {
        webRtcIds[userId] = uuid();
    });

    return webRtcIds;
};

export default {
    getFilePathFromId,
    createWebRtcIds
};
