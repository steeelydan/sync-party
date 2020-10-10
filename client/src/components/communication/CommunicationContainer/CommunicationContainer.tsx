import Peer from 'peerjs';
import React, {
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import Chat from '../../ui/Chat/Chat';
import CommunicationBar from '../../ui/CommunicationBar/CommunicationBar';
import WebRtc from '../../ui/WebRtc/WebRtc';

interface Props {
    socket: SocketIOClient.Socket | null;
    partyId: string | null;
    ourUserId: string | null;
    setPlayerState: Function;
    uiVisible: boolean;
    freezeUiVisible: Function;
}

export default function CommunicationContainer({
    socket,
    partyId,
    ourUserId,
    setPlayerState,
    uiVisible,
    freezeUiVisible
}: Props): ReactElement {
    const [webRtcPeer, setWebRtcPeer] = useState<Peer | null>(null);
    const [chatIsActive, setChatIsActive] = useState(false);
    const [webRtcAudioIsActive, setWebRtcAudioIsActive] = useState(false);
    const [webRtcVideoIsActive, setWebRtcVideoIsActive] = useState(false);
    const [ourMediaReady, setOurMediaReady] = useState(false);

    const [mediaStreams, setMediaStreams] = useState<{
        [userId: string]: MediaStream;
    }>({});
    const mediaStreamsRef = useRef(mediaStreams);

    const [callList, setCallList] = useState<{
        [userId: string]: Peer.MediaConnection;
    }>({});
    const callListRef = useRef(callList);

    // Update references
    useEffect(() => {
        callListRef.current = callList;
        mediaStreamsRef.current = mediaStreams;
    }, [mediaStreams, callList]);

    const getOurMediaStream = async (withVideo: boolean): Promise<void> => {
        if (ourUserId) {
            const ourStream = await navigator.mediaDevices.getUserMedia({
                video: withVideo,
                audio: {
                    autoGainControl: true
                }
            });

            setMediaStreams({
                ...mediaStreamsRef.current,
                [ourUserId]: ourStream
            });

            setTimeout(() => {
                setOurMediaReady(true);
            }, 1000);
        }
    };

    const joinWebRtc = (withVideo: boolean): void => {
        if (ourUserId && socket) {
            const peer = new Peer(ourUserId, {
                host: process.env.REACT_APP_WEBRTC_ROUTE,
                port: parseInt(process.env.REACT_APP_WEBRTC_PORT || '4000'),
                path: '/peerjs',
                debug: process.env.NODE_ENV === 'development' ? 2 : 0
            });

            setWebRtcPeer(peer);
            getOurMediaStream(withVideo);
        }
    };

    const leaveWebRtc = (): void => {
        if (webRtcPeer && socket && partyId) {
            if (ourUserId && mediaStreamsRef.current[ourUserId]) {
                mediaStreamsRef.current[ourUserId]
                    .getTracks()
                    .forEach(function (track) {
                        track.stop();
                    });
            }
            webRtcPeer.destroy();
            setMediaStreams({});
            setCallList({});
            setWebRtcPeer(null);
            setOurMediaReady(false);
            socket.off('joinWebRtc');
            socket.off('leaveWebRtc');
            socket.emit('leaveWebRtc', {
                partyId: partyId
            });
        }
    };

    const handleCall = useCallback(
        (call: Peer.MediaConnection): void => {
            if (ourUserId) {
                call.answer(mediaStreamsRef.current[ourUserId]);

                setCallList({
                    ...callListRef.current,
                    [call.peer]: call
                });

                if (mediaStreamsRef.current) {
                    call.on('stream', (theirStream: MediaStream) => {
                        setMediaStreams({
                            ...mediaStreamsRef.current,
                            [call.peer]: theirStream
                        });
                    });
                }
            }
        },
        [ourUserId]
    );

    const callUser = useCallback(
        (theirId: string, stream: MediaStream): void => {
            if (webRtcPeer && ourUserId) {
                const call = webRtcPeer.call(theirId, stream);

                setCallList({
                    ...callListRef.current,
                    [theirId]: call
                });

                call.on('stream', (theirStream) => {
                    setMediaStreams({
                        ...mediaStreamsRef.current,
                        [theirId]: theirStream
                    });
                });
            }
        },
        [ourUserId, webRtcPeer]
    );

    const hangUpOnUser = useCallback((theirId: string): void => {
        if (callListRef.current[theirId]) {
            callListRef.current[theirId].close();
            const newCallList = {
                ...callListRef.current
            };
            delete newCallList[theirId];
            setCallList(newCallList);
        }

        const newWebRtcStreams = {
            ...mediaStreamsRef.current
        };
        delete newWebRtcStreams[theirId];

        setMediaStreams(newWebRtcStreams);
    }, []);

    // Handle RTC
    useEffect((): void => {
        if (webRtcPeer && ourMediaReady && ourUserId && partyId && socket) {
            webRtcPeer.on('call', handleCall);

            // Other user joins
            socket.on('joinWebRtc', (theirId: string) => {
                if (mediaStreamsRef.current) {
                    if (theirId !== ourUserId) {
                        callUser(theirId, mediaStreamsRef.current[ourUserId]);
                    }
                }
            });

            // Other user leaves
            socket.on('leaveWebRtc', (data: { userId: string }) => {
                const theirId = data.userId;

                hangUpOnUser(theirId);
            });

            socket.emit('joinWebRtc', {
                userId: ourUserId,
                partyId: partyId
            });
        }
    }, [
        webRtcPeer,
        ourMediaReady,
        callUser,
        handleCall,
        hangUpOnUser,
        partyId,
        socket,
        ourUserId
    ]);

    const toggleChat = (): void => {
        setChatIsActive(!chatIsActive);
    };

    const toggleWebRtcAudio = (): void => {
        if (!webRtcAudioIsActive) {
            joinWebRtc(false);
        } else {
            leaveWebRtc();
        }

        setWebRtcAudioIsActive(!webRtcAudioIsActive);
    };

    const toggleWebRtcVideo = (): void => {
        if (!webRtcVideoIsActive) {
            joinWebRtc(true);
        } else {
            leaveWebRtc();
        }

        setWebRtcVideoIsActive(!webRtcVideoIsActive);
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
            ></WebRtc>
            {uiVisible && (
                <CommunicationBar
                    toggleChat={toggleChat}
                    toggleWebRtcAudio={toggleWebRtcAudio}
                    toggleWebRtcVideo={toggleWebRtcVideo}
                    chatIsActive={chatIsActive}
                    webRtcAudioIsActive={webRtcAudioIsActive}
                    uiVisible={uiVisible}
                    webRtcVideoIsActive={webRtcVideoIsActive}
                ></CommunicationBar>
            )}
        </>
    );
}
