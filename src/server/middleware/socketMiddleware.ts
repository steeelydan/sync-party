import type { RequestHandler } from 'express';
import type { PassportStatic } from 'passport';
import type { Server, Socket } from 'socket.io';

// https://github.com/jfromaniello/passport.socketio/issues/148
export const authenticateSocketRequest = (
    io: Server,
    sessionMiddleware: RequestHandler,
    passport: PassportStatic
) => {
    const socketIoWrap = (middleware: any) => {
        return (socket: Socket, next: (err?: Error | undefined) => void) => {
            return middleware(socket.request, {}, next);
        };
    };

    io.use(socketIoWrap(sessionMiddleware));
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
