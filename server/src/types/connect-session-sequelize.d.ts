// https://github.com/calebsander/connect-session-sequelize-types

declare module 'connect-session-sequelize' {
    import { Store } from 'express-session';
    import * as Sequelize from 'sequelize';

    export interface DefaultFields {
        data: string;
        expires: Date;
    }

    export interface Data {
        [column: string]: any;
    }

    export interface SequelizeStoreOptions {
        db: Sequelize.Sequelize;
        table?: Sequelize.Model<any, any>;
        extendDefaultFields?: (defaults: DefaultFields, session: any) => Data;
        checkExpirationInterval?: number;
        expiration?: number;
    }

    export class SequelizeStore extends Store {
        sync(): void;
        touch: (sid: string, data: any, callback?: (err: any) => void) => void;
    }

    export interface SequelizeStoreConstructor {
        new (options: SequelizeStoreOptions): SequelizeStore;
    }

    export function init(store: typeof Store): SequelizeStoreConstructor;
}
