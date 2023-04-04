import compression from 'compression';

import type { Express } from 'express';

export const useCompression = (app: Express): void => {
    app.use(compression());
};
