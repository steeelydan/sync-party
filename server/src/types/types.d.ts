declare namespace Express {
    export interface Request {
        user?: { // FIXME: Optional?
            id?: string;
            username?: string;
            role?: string;
        };
    }
}
