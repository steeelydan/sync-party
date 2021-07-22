// Override session user property
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23976#issuecomment-546404481
declare namespace Express {
    interface User extends RequestUser {}
    interface Request {
        newFileId?: string;
    }
}

type RequestUser = {
    id?: string;
    username?: string;
    role?: string;
};

type AuthenticatedPassportUser = {
    id?: string;
};

type Models = {
    User: any;
    Party: any;
    MediaItem: any;
};

type AppUser = {
    // Named this way to prevent conflict with passport & express session user types
    id: string;
    username: string;
    role: UserRole;
};

type NewUser = {
    id: string;
    username: string;
    role: UserRole;
    password: string;
};

type UserRole = 'admin' | 'user';

type NewParty = {
    name: string;
    owner: string;
    status: 'active' | 'stopped';
    members: string[];
    items: string[];
    metadata: {
        played?: {
            [mediaItemId: string]: boolean;
        };
    };
    settings: {};
};

type Party = NewParty & {
    id: string;
};

type PartyMember = {
    id: string;
    username: string;
};

type MediaItem = {
    id: string;
    type: 'web' | 'file';
    name: string;
    owner: string;
    url: string;
    createdAt: string;
    updatedAt: string;
};

type PlayWish = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    position: number;
    lastPosition?: LastPosition | null;
    requestLastPosition: boolean;
    timestamp: number;
    direction?: 'left' | 'right';
};

type LastPosition = {
    itemId: string;
    position: number;
};

type SyncStatus = {
    position: number;
    timestamp: number;
    isPlaying: boolean;
    serverTimeOffset: number;
    webRtc: WebRtcState;
};

type WebRtcState = {
    mode?: 'none' | 'audio' | 'video';
    isFullscreen?: boolean;
};
