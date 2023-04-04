import { Logger } from 'winston';
import { CoreTestUser } from '../server/core/testModels.js';

export type AuthenticatedPassportUser = {
    id?: string;
};

export type Models = {
    User: any;
    Party: any;
    MediaItem: any;
};

export type AppUser = {
    // Named this way to prevent conflict with passport & express session user types
    id: string;
    username: string;
    role: UserRole;
};

export type NewUser = {
    id: string;
    username: string;
    role: UserRole;
    password: string;
};

export type UserRole = 'admin' | 'user';

export type NewParty = {
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
    settings: { webRtcIds: Record<string, string> };
};

export type Party = NewParty & {
    id: string;
};

export type PartyMember = {
    id: string;
    username: string;
};

export type MediaItem = {
    id: string;
    type: 'web' | 'file';
    name: string;
    owner: string;
    url: string;
    settings: object;
    createdAt: string;
    updatedAt: string;
};

export type PlayWish = {
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

export type LastPosition = {
    itemId: string;
    position: number;
};

export type SyncStatus = {
    position: number;
    timestamp: number;
    isPlaying: boolean;
    serverTimeOffset: number;
    webRtc: WebRtcState;
};

export type WebRtcState = {
    mode?: 'none' | 'audio' | 'video';
    isFullscreen?: boolean;
};

export type RootAppState = {
    globalState: AppState;
};

export type AppState = {
    loggedIn: boolean | null;
    user: User | null;
    uiVisible: boolean;
    uiFocused: {
        chat: boolean;
    };
    playingItem: MediaItem | null;
    position: number;
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    userParties: ClientParty[] | null;
    userItems: MediaItem[] | null;
    actionMessage: ActionMessage | null;
    errorMessage: string | null;
    initialServerTimeOffset: number;
    chat: {
        [party: string]: FormattedChatMessage[];
    };
    webRtc: WebRtcState;
};

export type GlobalStateActionProperties = {
    loggedIn?: boolean | null;
    user?: User | null;
    uiVisible?: boolean;
    uiFocused?: {
        chat: boolean;
    };
    playingItem?: MediaItem | null;
    position?: number;
    party?: ClientParty | null;
    syncStatus?: SyncStatusReceiveMember[] | null;
    memberStatus?: MemberStatus | null;
    userParties?: ClientParty[] | null;
    userItems?: MediaItem[] | null;
    actionMessage?: ActionMessage | null;
    errorMessage?: string | null;
    initialServerTimeOffset?: number;
    chat?: {
        [party: string]: FormattedChatMessage[];
    };
    webRtc?: WebRtcState;
};

export type AppAction = {
    type: string;
    globalStateProperties: GlobalStateActionProperties;
};

export type PlayerState = {
    playOrder: PlayOrder | null;
    isPlaying: boolean;
    isFocused: boolean;
    isSeeking: boolean;
    isFullScreen: boolean;
    isSyncing: boolean;
    isBuffering: boolean;
    playlistIndex: number;
    playingItem: MediaItem | null;
    duration: number;
    sourceUrl: string;
    volume: number;
};

export type PlayerStateActionProperties = {
    playOrder?: PlayOrder | null;
    isPlaying?: boolean;
    isFocused?: boolean;
    isSeeking?: boolean;
    isFullScreen?: boolean;
    isSyncing?: boolean;
    isBuffering?: boolean;
    playlistIndex?: number;
    playingItem?: MediaItem | null;
    duration?: number;
    sourceUrl?: string;
    volume?: number;
};

export type PlayerTimeoutState = {
    actionMessageTimeoutId: null | NodeJS.Timeout;
    actionMessageTimeoutDone: boolean;
    uiTimeoutId: null | NodeJS.Timeout;
    uiTimeoutDelay: number;
    uiTimeoutTimestamp: number;
};

export type PlayerTimeoutStateActionProperties = {
    actionMessageTimeoutId?: ReturnType<typeof setTimeout> | null;
    actionMessageTimeoutDone?: boolean;
    uiTimeoutId?: ReturnType<typeof setTimeout> | null;
    uiTimeoutDelay?: number;
    uiTimeoutTimestamp?: number;
};

export type PartyPartialState = {
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    actionMessage: ActionMessage | null;
    playingItem: MediaItem | null;
};

export type User = {
    id: string;
    username: string;
    role: 'admin' | 'user';
};

export type ServerParty = {
    id: string;
    name: string;
    status: 'active' | 'stopped';
    members: string[];
};

export type ClientParty = {
    id: string;
    name: string;
    status: 'active' | 'stopped';
    members: ClientPartyMember[];
    items: MediaItem[];
    metadata: {
        played: {
            [mediaItemId: string]: boolean;
        };
    };
    settings: {
        webRtcIds: WebRtcIds;
    };
};

export type ClientPartyMember = {
    id: string;
    username: string;
};

export type NewMediaItem = {
    type: 'web' | 'file';
    name: string;
    owner: string | null;
    url: string;
};

export type WebRtcIds = {
    [userId: string]: string;
};

export type SyncStatusPartyMember = {
    id: string;
    position: number;
    timestamp: number;
    isPlaying: boolean;
    serverTimeOffset: number;
    webRtc: WebRtcState;
};

export type SyncStatusReceiveMember = {
    id: string;
    username: string;
    delta: number;
};

export type MemberStatus = {
    [userId: string]: {
        online: boolean;
        serverTimeOffset: number;
        webRtc: WebRtcState;
    };
};

export type ActionMessage = {
    text: string | JSX.Element;
};

export type PlayOrder = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    lastPosition?: LastPosition;
    position: number;
    timestamp: number;
    direction?: 'left' | 'right';
};

export interface ChatMessage {
    partyId: string;
    userId: string;
    userName: string;
    message: string;
}

export type FormattedChatMessage = ChatMessage & {
    message: Element[];
};

export type AxiosConfig = {
    withCredentials: boolean;
    // headers: {
    //     'Cache-Control': string;
    // };
    /* TBI
    xsrfCookieName: string;
    xsrfHeaderName: string;
    */
};

export type MediaTypes = 'audio' | 'video' | 'stream';

export type ReactPlayerState = {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
};

// Websockets messages

export type WebRtcJoinLeaveMessage = {
    webRtcId: string;
    partyId: string;
};

export type SyncStatusIncomingMessage = {
    [userId: string]: SyncStatusPartyMember;
};

export type SyncStatusOutgoingMessage = {
    partyId: string;
    userId: string;
    timestamp: number;
    position: number;
    isPlaying: boolean;
    webRtc: WebRtcState;
};

export type MediaItemUpdateMessage = Record<string, never>;

export type PartyUpdateMessage = { partyId: string };

export type JoinPartyMessage = {
    userId: string;
    partyId: string;
    timestamp: number;
};

export type LeavePartyMessage = { partyId: string };

// FIXME ex-TSFS types

export type TSFSCreationAttributes<T> = Omit<
    T,
    'id' | 'createdAt' | 'updatedAt'
>;

export type TSFSUserRole = 'admin' | 'user';

export type TSFSRequestUser = {
    id: string;
    username: string;
    role: string;
};

declare global {
    namespace Express {
        interface User extends TSFSRequestUser {}
    }
}

export type TSFSLogger = Logger;

export type TSFSPathConfig = {
    publicDirPath?: string;
    envPath?: string;
    manifestFilePath?: string;
    viewsDirPath?: string;
    logfileDirPath?: string;
};

export type TSFSRequiredEnvVars = string[];

export type TSFSValidEnvValues = Record<
    string,
    string[] | ((...args: string[]) => boolean)
>;

export type TSFSDbOptions = {
    logging: boolean;
    storage: string;
    dialect: 'sqlite';
};

export type TSFSDbConfig = {
    development?: TSFSDbOptions;
    test?: TSFSDbOptions;
    production?: TSFSDbOptions;
};

export type TestGlobal = {
    testPathConfig: TSFSPathConfig;
};

export type CoreTestModels = {
    CoreTestUser: typeof CoreTestUser;
};
