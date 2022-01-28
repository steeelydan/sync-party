import { RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { Server, Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

// https://github.com/jfromaniello/passport.socketio/issues/148
export const authenticateSocketRequest = (
    io: Server,
    session: RequestHandler,
    passport: PassportStatic
) => {
    const socketIoWrap = (middleware: any) => {
        return (
            socket: Socket,
            next: (err?: ExtendedError | undefined) => void
        ) => {
            return middleware(socket.request, {}, next);
        };
    }

    io.use(socketIoWrap(session));
    io.use(socketIoWrap(passport.initialize()));
    io.use(socketIoWrap(passport.session()));

    io.use((socket, next) => {
        // @ts-ignore
        if (socket.request.user) {
            next();
        } else {
            next(new Error('unauthorized'));
        }
    });
};
