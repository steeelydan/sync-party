import { Express } from 'express';
import compression from 'compression';

export const useCompression = (app: Express): void => {
    app.use(compression());
};
