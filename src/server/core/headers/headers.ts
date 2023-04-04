import helmet from 'helmet';
import { Express } from 'express';

// https://github.com/helmetjs/helmet/issues/235
type ExtractedHelmetOptions = Parameters<typeof helmet>[0];

export const setupHeaders = (
    app: Express,
    helmetConfiguration?: ExtractedHelmetOptions
): void => {
    if (helmetConfiguration) {
        app.use(helmet(helmetConfiguration));
    } else {
        app.use(helmet());
    }
};
