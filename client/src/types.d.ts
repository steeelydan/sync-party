type RootAppState = {
    globalState: AppState;
};

type AppState = {
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

type GlobalStateActionProperties = {
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

type AppAction = {
    type: string;
    globalStateProperties: GlobalStateActionProperties;
};

type PlayerState = {
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

type PlayerStateActionProperties = {
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

type PlayerTimeoutState = {
    actionMessageTimeoutId: ReturnType<typeof setTimeout> | null;
    actionMessageTimeoutDone: boolean;
    uiTimeoutId: ReturnType<typeof setTimeout> | null;
    uiTimeoutDelay: number;
    uiTimeoutTimestamp: number;
};

type PlayerTimeoutStateActionProperties = {
    actionMessageTimeoutId?: ReturnType<typeof setTimeout> | null;
    actionMessageTimeoutDone?: boolean;
    uiTimeoutId?: ReturnType<typeof setTimeout> | null;
    uiTimeoutDelay?: number;
    uiTimeoutTimestamp?: number;
};

type PartyPartialState = {
    party: ClientParty | null;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    actionMessage: ActionMessage | null;
    playingItem: MediaItem | null;
};

type User = {
    id: string;
    username: string;
    role: 'admin' | 'user';
};

type ServerParty = {
    id: string;
    name: string;
    status: 'active' | 'stopped';
    members: string[];
};

type ClientParty = {
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

type ClientPartyMember = {
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

type NewMediaItem = {
    type: 'web' | 'file';
    name: string;
    owner: string | null;
    url: string;
};

type WebRtcIds = {
    [userId: string]: string;
};

type SyncStatusIncoming = {
    [userId: string]: SyncStatusPartyMember;
};

type SyncStatusOutgoing = {
    partyId: string;
    userId: string;
    timestamp: number;
    position: number;
    isPlaying: boolean;
    webRtc: WebRtcState;
};

type SyncStatusPartyMember = {
    id: string;
    position: number;
    timestamp: number;
    isPlaying: boolean;
    serverTimeOffset: number;
    webRtc: WebRtcState;
};

type SyncStatusReceiveMember = {
    id: string;
    username: string;
    delta: number;
};

type MemberStatus = {
    [userId: string]: {
        online: boolean;
        serverTimeOffset: number;
        webRtc: WebRtcState;
    };
};

type WebRtcState = { mode: 'none' | 'audio' | 'video' };

type ActionMessage = {
    text: string | JSX.Element;
};

type PlayWish = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    position: number;
    timestamp: number;
    direction?: 'left' | 'right';
};

type PlayOrder = {
    issuer: string;
    partyId: string;
    mediaItemId: string;
    type: 'web' | 'file';
    isPlaying: boolean;
    position: number;
    timestamp: number;
    direction?: 'left' | 'right';
};

interface ChatMessage {
    partyId: string;
    userId: string;
    userName: string;
    message: string;
}

interface FormattedChatMessage extends ChatMessage {
    message: JSX.Element[];
}

type AxiosConfig = {
    withCredentials: boolean;
    /* TBI
    xsrfCookieName: string;
    xsrfHeaderName: string;
    */
};

type MediaTypes = 'audio' | 'video' | 'stream';

type ReactPlayerState = {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
};
