import { initParty } from '../models/Party.js';
import { initUser } from '../models/User.js';
import { initMediaItem } from '../models/MediaItem.js';

import type { Sequelize } from 'sequelize';

export const initModels = (sequelize: Sequelize): void => {
    initParty(sequelize);
    initUser(sequelize);
    initMediaItem(sequelize);
};
