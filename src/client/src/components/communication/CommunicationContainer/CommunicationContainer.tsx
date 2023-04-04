import Peer, { MediaConnection } from 'peerjs';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';
import Chat from '../Chat/Chat';
import CommunicationBar from '../CommunicationBar/CommunicationBar';
import WebRtc from '../WebRtc/WebRtc';
import { Socket } from 'socket.io-client';
import {
    PlayerStateActionProperties,
    WebRtcIds
} from '../../../../../shared/types';

interface Props {
    socket: Socket | null;
    partyId: string | null;
    webRtcIds: WebRtcIds;
    ourUserId: string;
    setPlayerState: (playerState: PlayerStateActionProperties) => void;
    uiVisible: boolean;
    freezeUiVisible: (freeze: boolean) => void;
    handlePlayPause: () => void;
}

export default function CommunicationContainer({
    socket,
    partyId,
    webRtcIds,
    ourUserId,
    setPlayerState,
    uiVisible,
    freezeUiVisible,
    handlePlayPause
}: Props): ReactElement {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const ourWebRtcId = webRtcIds[ourUserId];

    const [webRtcPeer, setWebRtcPeer] = useState<Peer | null>(null);
    const webRtcPeerRef = useRef(webRtcPeer);
    const [chatIsActive, setChatIsActive] = useState(false);
    const [webRtcAudioIsActive, setWebRtcAudioIsActive] = useState(false);
    const [webRtcVideoIsActive, setWebRtcVideoIsActive] = useState(false);
    const [mediaPermissionPending, setMediaPermissionPending] = useState(false);
    const [ourMediaReady, setOurMediaReady] = useState(false);
    const [showVideos, setShowVideos] = useState(true);
    const [audioIsMuted, setAudioIsMuted] = useState(false);
    const [videoIsMuted, setVideoIsMuted] = useState(false);

    const [mediaStreams, setMediaStreams] = useState<{
        [userId: string]: MediaStream;
    }>({});
    const mediaStreamsRef = useRef(mediaStreams);

    const [callList, setCallList] = useState<{
        [userId: string]: MediaConnection;
    }>({});
    const callListRef = useRef(callList);

    useEffect(() => {
        webRtcPeerRef.current = webRtcPeer;
    });

    // Update references
    useEffect(() => {
        callListRef.current = callList;
        mediaStreamsRef.current = mediaStreams;
    }, [mediaStreams, callList]);

    const createWebRtcPeer = async (): Promise<void> => {
        if (ourWebRtcId && SERVER_PORT) {
            const response = await Axios.post(
                '/api/webRtcServerKey',
                {
                    partyId: partyId,
                    userId: ourUserId,
                    webRtcId: ourWebRtcId
                },
                axiosConfig()
            );

            const webRtcServerKey = response.data.webRtcServerKey;

            const peer = new Peer(ourWebRtcId, {
                host: '/',
                port: NODE_ENV === 'development' ? parseInt(SERVER_PORT) : 443,
                path: '/peerjs',
                key: webRtcServerKey,
                debug: NODE_ENV === 'development' ? 2 : 0,
                secure: true
            });

            setWebRtcPeer(peer);
        }
    };

    const getOurMediaStream = async (withVideo: boolean): Promise<void> => {
        if (ourWebRtcId) {
            let ourStream;

            try {
                ourStream = await navigator.mediaDevices.getUserMedia({
                    video: withVideo,
                    audio: {
                        autoGainControl: true,
                        channelCount: 1
                    }
                });
            } catch (error) {
                let message;

                if ((error as Error).name === 'AbortError') {
                    message = t('webRtc.abortError');
                } else if ((error as Error).name === 'NotAllowedError') {
                    message = t(
                        withVideo
                            ? 'webRtc.missingPermissionsVideo'
                            : 'webRtc.missingPermissionsAudio'
                    );
                } else if ((error as Error).name === 'NotFoundError') {
                    message = t(
                        withVideo ? 'webRtc.noCamera' : 'webRtc.noMicrophone'
                    );
                } else {
                    message =
                        (error as Error).name + ': ' + (error as Error).message;
                }

                dispatch(
                    setGlobalState({
                        errorMessage: message
                    })
                );

                setMediaPermissionPending(false);

                if (withVideo) {
                    setWebRtcVideoIsActive(false);
                } else {
                    setWebRtcAudioIsActive(false);
                }

                return;
            }

            setMediaStreams({
                ...mediaStreamsRef.current,
                [ourWebRtcId]: ourStream
            });

            createWebRtcPeer();

            setOurMediaReady(true);
        }
    };

    const joinWebRtc = async (withVideo: boolean): Promise<void> => {
        getOurMediaStream(withVideo);
    };

    const leaveWebRtc = useCallback((): void => {
        if (webRtcPeerRef.current && socket && partyId) {
            if (ourWebRtcId && mediaStreamsRef.current[ourWebRtcId]) {
                mediaStreamsRef.current[ourWebRtcId]
                    .getTracks()
                    .forEach(function (track) {
                        track.stop();
                    });
            }
            webRtcPeerRef.current.destroy();
            setMediaStreams({});
            setCallList({});
            setWebRtcPeer(null);
            setOurMediaReady(false);
            setAudioIsMuted(false);
            setVideoIsMuted(false);
            socket.off('joinWebRtc');
            socket.off('leaveWebRtc');
            socket.emit('leaveWebRtc', {
                webRtcId: ourWebRtcId,
                partyId: partyId
            });
            dispatch(
                setGlobalState({
                    webRtc: {
                        mode: 'none'
                    }
                })
            );
        }
    }, [dispatch, ourWebRtcId, partyId, socket]);

    // Leave WebRTC when component unmounts
    useEffect(() => {
        return (): void => {
            leaveWebRtc();
        };
    }, [leaveWebRtc]);

    const hangUpOnUser = useCallback((theirWebRtcId: string): void => {
        if (callListRef.current[theirWebRtcId]) {
            callListRef.current[theirWebRtcId].close();
            const newCallList = {
                ...callListRef.current
            };
            delete newCallList[theirWebRtcId];
            setCallList(newCallList);
        }

        const newWebRtcStreams = {
            ...mediaStreamsRef.current
        };
        delete newWebRtcStreams[theirWebRtcId];

        setMediaStreams(newWebRtcStreams);
    }, []);

    const callUser = useCallback(
        (theirWebRtcId: string, ourStream: MediaStream): void => {
            if (webRtcPeer) {
                const call = webRtcPeer.call(theirWebRtcId, ourStream);

                setCallList({
                    ...callListRef.current,
                    [theirWebRtcId]: call
                });

                call.on('stream', (theirStream) => {
                    setMediaStreams({
                        ...mediaStreamsRef.current,
                        [theirWebRtcId]: theirStream
                    });
                });

                // call.on('close', () => {
                //     hangUpOnUser(theirWebRtcId);
                // });

                // call.peerConnection.oniceconnectionstatechange = (): void => {
                //     if (
                //         call.peerConnection.iceConnectionState ===
                //         'disconnected'
                //     ) {
                //         hangUpOnUser(theirWebRtcId);
                //     }
                // };
            }
        },
        [webRtcPeer]
    );

    const handleCall = useCallback(
        (call: MediaConnection): void => {
            if (ourWebRtcId) {
                call.answer(mediaStreamsRef.current[ourWebRtcId]);
                const theirWebRtcId = call.peer;

                setCallList({
                    ...callListRef.current,
                    [theirWebRtcId]: call
                });

                if (mediaStreamsRef.current) {
                    call.on('stream', (theirStream: MediaStream) => {
                        setMediaStreams({
                            ...mediaStreamsRef.current,
                            [theirWebRtcId]: theirStream
                        });
                    });

                    // call.on('close', () => {
                    //     hangUpOnUser(theirWebRtcId);
                    // });

                    // call.peerConnection.oniceconnectionstatechange = (): void => {
                    //     if (
                    //         call.peerConnection.iceConnectionState ===
                    //         'disconnected'
                    //     ) {
                    //         hangUpOnUser(theirWebRtcId);
                    //     }
                    // };
                }
            }
        },
        [ourWebRtcId]
    );

    // Handle RTC
    useEffect((): void => {
        if (webRtcPeer && ourMediaReady && ourWebRtcId && partyId && socket) {
            webRtcPeer.on('call', handleCall);

            // Other user joins
            socket.on('joinWebRtc', (theirWebRtcId: string) => {
                if (mediaStreamsRef.current) {
                    if (theirWebRtcId !== ourWebRtcId) {
                        callUser(
                            theirWebRtcId,
                            mediaStreamsRef.current[ourWebRtcId]
                        );
                    }
                }
            });

            // Other user leaves
            socket.on('leaveWebRtc', (data: { webRtcId: string }) => {
                const theirWebRtcId = data.webRtcId;

                hangUpOnUser(theirWebRtcId);
            });

            socket.emit('joinWebRtc', {
                webRtcId: ourWebRtcId,
                partyId: partyId
            });

            setMediaPermissionPending(false);

            dispatch(
                setGlobalState({
                    webRtc: {
                        mode: webRtcAudioIsActive ? 'audio' : 'video'
                    }
                })
            );
        }
    }, [
        webRtcPeer,
        ourMediaReady,
        callUser,
        handleCall,
        hangUpOnUser,
        partyId,
        socket,
        ourWebRtcId,
        dispatch,
        webRtcAudioIsActive
    ]);

    const toggleChat = (): void => {
        if (chatIsActive) {
            freezeUiVisible(false);
        }

        setChatIsActive(!chatIsActive);
    };

    const toggleWebRtcAudio = (): void => {
        if (!mediaPermissionPending) {
            if (!webRtcAudioIsActive) {
                setMediaPermissionPending(true);
                joinWebRtc(false);
            } else {
                leaveWebRtc();
            }

            setWebRtcAudioIsActive(!webRtcAudioIsActive);
        }
    };

    const toggleWebRtcVideo = (): void => {
        if (!mediaPermissionPending) {
            if (!webRtcVideoIsActive) {
                setMediaPermissionPending(true);
                joinWebRtc(true);
            } else {
                leaveWebRtc();
            }

            setWebRtcVideoIsActive(!webRtcVideoIsActive);
        }
    };

    const toggleAudioIsMuted = (): void => {
        if (ourWebRtcId && !mediaPermissionPending) {
            const newStreams = { ...mediaStreams };
            newStreams[ourWebRtcId].getAudioTracks()[0].enabled = audioIsMuted;
            setMediaStreams(newStreams);
            setAudioIsMuted(!audioIsMuted);
        }
    };

    const toggleVideoIsMuted = (): void => {
        if (ourWebRtcId && !mediaPermissionPending) {
            const newStreams = { ...mediaStreams };
            newStreams[ourWebRtcId].getVideoTracks()[0].enabled = videoIsMuted;
            setMediaStreams(newStreams);
            setVideoIsMuted(!videoIsMuted);
        }
    };

    return (
        <>
            <Chat
                isActive={chatIsActive}
                socket={socket}
                setPlayerFocused={(focused: boolean): void =>
                    setPlayerState({
                        isFocused: focused
                    })
                }
                freezeUiVisible={freezeUiVisible}
            ></Chat>
            <WebRtc
                videoIsActive={webRtcVideoIsActive}
                mediaStreams={mediaStreams}
                mediaStreamsRef={mediaStreamsRef}
                ourUserId={ourUserId}
                webRtcIds={webRtcIds}
                showVideos={showVideos}
                handlePlayPause={handlePlayPause}
            ></WebRtc>
            {uiVisible && (
                <CommunicationBar
                    toggleChat={toggleChat}
                    toggleWebRtcAudio={toggleWebRtcAudio}
                    toggleWebRtcVideo={toggleWebRtcVideo}
                    chatIsActive={chatIsActive}
                    webRtcAudioIsActive={webRtcAudioIsActive}
                    webRtcVideoIsActive={webRtcVideoIsActive}
                    uiVisible={uiVisible}
                    showVideos={showVideos}
                    setShowVideos={setShowVideos}
                    audioIsMuted={audioIsMuted}
                    videoIsMuted={videoIsMuted}
                    toggleAudioIsMuted={toggleAudioIsMuted}
                    toggleVideoIsMuted={toggleVideoIsMuted}
                ></CommunicationBar>
            )}
        </>
    );
}
