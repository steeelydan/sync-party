// Entities

export type IParty = NewParty & {
    id: string;
};
export type NewParty = {
    name: string;
    owner: string;
    status: PartyStatus;
    members: string[];
    items: string[];
    metadata: {
        played?: {
            [mediaItemId: string]: boolean;
        };
    };
    settings: { webRtcIds: Record<string, string> };
};
export type ServerParty = {
    id: string;
    name: string;
    status: PartyStatus;
    members: string[];
};
export type ClientParty = {
    id: string;
    name: string;
    status: PartyStatus;
    members: PartyMember[];
    items: IMediaItem[];
    metadata: {
        played: {
            [mediaItemId: string]: boolean;
        };
    };
    settings: {
        webRtcIds: WebRtcIds;
    };
};
export type PartyStatus = 'active' | 'stopped';

export type IUser = ClientUser & {
    password: string;
};
export type ClientUser = {
    // Named this way to prevent conflict with passport & express session user types
    id: string;
    username: string;
    role: UserRole;
    settings: {};
};
export type UserRole = 'admin' | 'user';
export type PartyMember = {
    id: string;
    username: string;
};

export type IMediaItem = {
    id: string;
    type: MediaItemType;
    name: string;
    owner: string;
    url: string;
    settings: object;
    createdAt: Date;
    updatedAt: Date;
};
export type NewMediaItem = {
    type: MediaItemType;
    name: string;
    owner: string | null;
    url: string;
};
export type MediaItemType = 'web' | 'file';

// Networking

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

export type PlayWish = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: MediaItemType;
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

export type PlayOrder = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: MediaItemType;
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

// Client State

export type RootAppState = {
    globalState: AppState;
};

export type AppState = {
    loggedIn: boolean | null;
    user: ClientUser | null;
    uiVisible: boolean;
    uiFocused: {
        chat: boolean;
    };
    playingItem: IMediaItem | null;
    position: number;
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    userParties: ClientParty[] | null;
    userItems: IMediaItem[] | null;
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
    user?: ClientUser | null;
    uiVisible?: boolean;
    uiFocused?: {
        chat: boolean;
    };
    playingItem?: IMediaItem | null;
    position?: number;
    party?: ClientParty | null;
    syncStatus?: SyncStatusReceiveMember[] | null;
    memberStatus?: MemberStatus | null;
    userParties?: ClientParty[] | null;
    userItems?: IMediaItem[] | null;
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
    playingItem: IMediaItem | null;
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
    playingItem?: IMediaItem | null;
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

export type PartyPartialState = {
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    actionMessage: ActionMessage | null;
    playingItem: IMediaItem | null;
};

export type WebRtcIds = {
    [userId: string]: string;
};

export type ReactPlayerState = {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
};

// GUI

export type ActionMessage = {
    text: string | JSX.Element;
};

export type AddMediaTab = 'user' | 'web' | 'file';

// Media

export type MediaTypes = 'audio' | 'video' | 'stream';

// Environment, Paths, Database

export type PathConfig = {
    publicDirPath?: string;
    envPath?: string;
    manifestFilePath?: string;
    viewsDirPath?: string;
    logfileDirPath?: string;
};

export type RequiredEnvVars = string[];

export type ValidEnvValues = Record<
    string,
    string[] | ((...args: string[]) => boolean)
>;

export type DbOptions = {
    logging: boolean;
    storage: string;
    dialect: 'sqlite';
};

export type DbConfig = {
    development?: DbOptions;
    test?: DbOptions;
    production?: DbOptions;
};
