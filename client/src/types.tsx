export type RootAppState = {
    globalState: AppState;
};

export type AppState = {
    loggedIn: boolean | null;
    user: User | null;
    uiVisible: boolean;
    playingItem: MediaItem | null;
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    userParties: ClientParty[] | null;
    userItems: MediaItem[] | null;
    actionMessage: ActionMessage | null;
    errorMessage: string | null;
    initialServerTimeOffset: number;
};

export type GlobalStateActionProperties = {
    loggedIn?: boolean | null;
    user?: User | null;
    uiVisible?: boolean;
    playingItem?: MediaItem | null;
    party?: ClientParty | null;
    syncStatus?: SyncStatusReceiveMember[] | null;
    memberStatus?: MemberStatus | null;
    userParties?: ClientParty[] | null;
    userItems?: MediaItem[] | null;
    actionMessage?: ActionMessage | null;
    errorMessage?: string | null;
    initialServerTimeOffset?: number;
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
    position: number;
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
    position?: number;
    playingItem?: MediaItem | null;
    duration?: number;
    sourceUrl?: string;
    volume?: number;
};

export type PlayerTimeoutState = {
    actionMessageTimeout: ReturnType<typeof setTimeout> | null;
    actionMessageTimeoutDone: boolean;
    uiTimeout: ReturnType<typeof setTimeout> | null;
    uiTimeoutDelay: number;
    uiTimeoutTimestamp: number;
};

export type PlayerTimeoutStateActionProperties = {
    actionMessageTimeout?: ReturnType<typeof setTimeout> | null;
    actionMessageTimeoutDone?: boolean;
    uiTimeout?: ReturnType<typeof setTimeout> | null;
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
};

export type ClientPartyMember = {
    id: string;
    username: string;
};

export type MediaItem = {
    id: string;
    type: 'web' | 'file';
    name: string;
    owner: string;
    url: string;
    createdAt: string;
    updatedAt: string;
};

export type NewMediaItem = {
    type: 'web' | 'file';
    name: string;
    owner: string | null;
    url: string;
};

export type SyncStatusIncoming = {
    [userId: string]: SyncStatusPartyMember;
};

export type SyncStatusOutgoing = {
    partyId: string;
    userId: string;
    timestamp: number;
    position: number;
    isPlaying: boolean;
};

export type SyncStatusPartyMember = {
    id: string;
    position: number;
    timestamp: number;
    isPlaying: boolean;
    serverTimeOffset: number;
};

export type SyncStatusReceiveMember = {
    id: string;
    username: string;
    delta: number;
};

export type MemberStatus = {
    [userId: string]: { online: boolean; serverTimeOffset: number };
};

export type ActionMessage = {
    text: string | JSX.Element;
};

export type PlayWish = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    position: number;
    timestamp: number;
    direction?: 'left' | 'right';
};

export type PlayOrder = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    position: number;
    timestamp: number;
    direction?: 'left' | 'right';
};

export type AxiosConfig = {
    withCredentials: boolean;
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
