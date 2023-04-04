import { useRef, useEffect } from 'react';
import { setGlobalState } from '../actions/globalActions';

import { faMusic, faFilm } from '@fortawesome/free-solid-svg-icons';
import {
    faYoutube,
    faSoundcloud,
    faTwitch
} from '@fortawesome/free-brands-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import type { Dispatch } from 'react';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type ReactPlayer from 'react-player';
import type {
    AppAction,
    AppState,
    AxiosConfig,
    ClientParty,
    IMediaItem,
    MediaTypes,
    PartyPartialState,
    PlayerState,
    SyncStatusPartyMember,
    ClientUser
} from '../../../shared/types';

const baseState: AppState = {
    loggedIn: false,
    user: null,
    uiVisible: true,
    uiFocused: {
        chat: false
    },
    playingItem: null,
    position: 0,
    party: null,
    syncStatus: null,
    memberStatus: null,
    userParties: null,
    userItems: null,
    actionMessage: null,
    errorMessage: null,
    initialServerTimeOffset: 0,
    chat: {},
    webRtc: {
        mode: 'none',
        isFullscreen: false
    }
};

const noPartyState: PartyPartialState = {
    party: null,
    syncStatus: null,
    memberStatus: null,
    actionMessage: null,
    playingItem: null
};

const axiosConfig = (): AxiosConfig => {
    return {
        withCredentials: true
        // headers: {
        //     'Cache-Control': 'no-cache, no-store, max-age=0'
        // }
        /* TBI
        xsrfCookieName: '_csrf',
        xsrfHeaderName: 'X-CSRF-TOKEN' */
    };
};

const videoExtensions = /\.(mp4|m4v|avi|mkv|webm)$/;
const audioExtensions = /\.(mp3|wav|flac|m4a|aac|ogg)$/;

const testMediaType = (url: string): MediaTypes => {
    if (audioExtensions.test(url)) {
        return 'audio';
    } else if (videoExtensions.test(url)) {
        return 'video';
    } else {
        return 'stream';
    }
};

const getIconFromFileType = (url: string): IconProp => {
    let icon: IconDefinition;

    if (testMediaType(url) === 'audio') {
        icon = faMusic;
    } else if (testMediaType(url) === 'video') {
        icon = faFilm;
    } else if (getSite(url) === 'youtube') {
        icon = faYoutube;
    } else if (getSite(url) === 'soundcloud') {
        icon = faSoundcloud;
    } else if (getSite(url) === 'twitch') {
        icon = faTwitch;
    } else {
        icon = faFile;
    }

    return icon;
};

const getSite = (url: string): string => {
    let site = '';

    // FIXME needs to be more precise
    if (url.includes('youtube.') || url.includes('youtu.be')) {
        site = 'youtube';
    } else if (url.includes('facebook.')) {
        site = 'facebook';
    } else if (url.includes('vimeo.')) {
        site = 'vimeo';
    } else if (url.includes('soundcloud.')) {
        site = 'soundcloud';
    } else if (url.includes('twitch.')) {
        site = 'twitch';
    }

    return site;
};

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback: () => void, delay: number): void => {
    const savedCallback = useRef<() => void>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick(): void {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return (): void => clearInterval(id);
        } else {
            return undefined;
        }
    }, [delay]);
};

const updateCurrentParty = (
    dispatch: Dispatch<AppAction>,
    userParties: ClientParty[],
    party: ClientParty
): void => {
    dispatch(
        setGlobalState({
            party:
                userParties.find(
                    (newParty: ClientParty) => newParty.id === party.id
                ) || null
        })
    );
};

const handleKeyCommands = (
    reactPlayer: ReactPlayer,
    event: KeyboardEvent,
    handlePlayPause: () => void,
    handleFullScreen: () => void,
    playerState: PlayerState,
    volumeStep: number,
    setPlayerState: ({
        volume,
        isSeeking
    }: {
        volume?: number;
        isSeeking?: boolean;
    }) => void,
    seekStepSize: number,
    emitPlayWish: (
        mediaItem: IMediaItem,
        isPlaying: boolean,
        lastPositionItemId: string | null,
        requestLastPosition: boolean,
        newPosition?: number,
        noIssuer?: boolean,
        direction?: 'left' | 'right'
    ) => void
): void => {
    switch (event.code) {
        case 'Space': {
            event.preventDefault();
            handlePlayPause();
            break;
        }
        case 'KeyF': {
            event.preventDefault();
            handleFullScreen();
            break;
        }
        case 'ArrowUp': {
            event.preventDefault();
            const newVolume =
                playerState.volume + volumeStep <= 1
                    ? playerState.volume + volumeStep
                    : 1;
            setPlayerState({
                volume: newVolume
            });
            localStorage.setItem('volume', newVolume.toString());
            break;
        }
        case 'ArrowDown': {
            event.preventDefault();
            const newVolume =
                playerState.volume - volumeStep >= 0
                    ? playerState.volume - volumeStep
                    : 0;
            setPlayerState({
                volume: newVolume
            });
            localStorage.setItem('volume', newVolume.toString());
            break;
        }
        case 'ArrowLeft': {
            event.preventDefault();
            if (playerState.playingItem) {
                const newPosition =
                    ((reactPlayer.getCurrentTime() /
                        reactPlayer.getDuration()) *
                        playerState.duration -
                        seekStepSize) /
                    playerState.duration;
                // seek(newPosition);
                setPlayerState({
                    isSeeking: true
                });
                emitPlayWish(
                    playerState.playingItem,
                    playerState.isPlaying,
                    playerState.playingItem.id,
                    false,
                    newPosition,
                    false,
                    'left'
                );
            }
            break;
        }
        case 'ArrowRight': {
            event.preventDefault();
            if (playerState.playingItem) {
                const newPosition =
                    ((reactPlayer.getCurrentTime() /
                        reactPlayer.getDuration()) *
                        playerState.duration +
                        seekStepSize) /
                    playerState.duration;
                setPlayerState({
                    isSeeking: true
                });
                emitPlayWish(
                    playerState.playingItem,
                    playerState.isPlaying,
                    playerState.playingItem.id,
                    false,
                    newPosition,
                    false,
                    'right'
                );
            }
            break;
        }
        default: {
            return;
        }
    }
};

const calculateSyncDelta = (
    syncStatusParty: { [userId: string]: SyncStatusPartyMember },
    playerStateRef: React.MutableRefObject<PlayerState>,
    user: ClientUser,
    memberId: string
): number => {
    const userPositionMs =
        syncStatusParty[user.id].position *
        playerStateRef.current.duration *
        1000;
    const userTimestamp =
        syncStatusParty[user.id].timestamp +
        syncStatusParty[user.id].serverTimeOffset;
    const memberPositionMs =
        syncStatusParty[memberId].position *
        playerStateRef.current.duration *
        1000;
    const memberTimestamp =
        syncStatusParty[memberId].timestamp +
        syncStatusParty[memberId].serverTimeOffset;

    const positionDelta = memberPositionMs - userPositionMs;
    const timestampDelta = memberTimestamp - userTimestamp;

    return timestampDelta - positionDelta;
};

const reorderItems = (
    list: IMediaItem[],
    startIndex: number,
    endIndex: number
): string[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const idResult = result.map((item) => item.id);

    return idResult;
};

const formatChatMessage = (message: string): JSX.Element[] => {
    let remainingText = message;
    const textElements = [];

    // Detect links
    if (remainingText.includes('https://')) {
        while (remainingText.includes('https://')) {
            const linkPosition = remainingText.indexOf('https://');
            const wordBefore = remainingText.substr(0, linkPosition);

            if (wordBefore !== '') {
                textElements.push(<>{remainingText.substr(0, linkPosition)}</>);
            }

            remainingText = remainingText.substr(linkPosition);
            const nextSpace = remainingText.indexOf(' ');
            let link = '';

            if (nextSpace > -1) {
                link = remainingText.substr(0, nextSpace);
                remainingText = remainingText.substr(nextSpace);
            } else {
                link = remainingText.substr(0);
                remainingText = '';
            }

            textElements.push(
                <a
                    className="break-all"
                    href={link}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {link}
                </a>
            );
        }

        textElements.push(<>{remainingText}</>);
    } else {
        textElements.push(<>{remainingText}</>);
    }

    return textElements;
};

const rndHandleStyles = {
    bottomRight: { display: 'none' },
    bottom: { display: 'none' },
    bottomLeft: { display: 'none' },
    left: { display: 'none' },
    topLeft: { display: 'none' },
    top: { display: 'none' },
    topRight: { display: 'none' }
};

export {
    baseState,
    noPartyState,
    axiosConfig,
    audioExtensions,
    videoExtensions,
    testMediaType,
    getIconFromFileType,
    getSite,
    useInterval,
    updateCurrentParty,
    handleKeyCommands,
    calculateSyncDelta,
    reorderItems,
    formatChatMessage,
    rndHandleStyles
};
