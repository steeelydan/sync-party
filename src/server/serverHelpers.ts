import path from 'path';
import { v4 as uuid } from 'uuid';

export const getFilePathFromId = (dbMediaItemId: string): string => {
    return path.join(path.resolve('data/uploads'), dbMediaItemId);
};

export const createWebRtcIds = (userIds: string[]) => {
    const webRtcIds: { [userId: string]: string } = {};
    userIds.forEach((userId) => {
        webRtcIds[userId] = uuid();
    });

    return webRtcIds;
};
