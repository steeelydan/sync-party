// Override session user property
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23976#issuecomment-546404481
declare namespace Express {
    interface User extends RequestUser {}
    interface Request {
        newFileId?: string;
    }
}

type RequestUser = {
    id: string;
    username: string;
    role: string;
};
