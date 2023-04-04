import express from 'express';

import type { Express } from 'express';

export const setupRequestParsers = (app: Express): void => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
};
