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
    party: ClientParty | null;
    user: User | null;
    setPlayerState: Function;
    uiVisible: boolean;
    freezeUiVisible: Function;
}

export default function CommunicationContainer({
    socket,
    party,
    user,
    setPlayerState,
    uiVisible,
    freezeUiVisible
}: Props): ReactElement {
    const [chatIsActive, setChatIsActive] = useState(false);
    const [webRtcIsActive, setWebRtcIsActive] = useState(false);
    const [webRtcVideoIsActive, setWebRtcVideoIsActive] = useState(false);

    const [webRtcPeer, setWebRtcPeer] = useState<Peer | null>(null);
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
        if (user) {
            const ourStream = await navigator.mediaDevices.getUserMedia({
                video: withVideo,
                audio: {
                    autoGainControl: true
                }
            });

            setMediaStreams({
                ...mediaStreamsRef.current,
                [user.id]: ourStream
            });

            setTimeout(() => {
                setOurMediaReady(true);
                console.log('our media is ready');
            }, 1000);
        }
    };

    const joinWebRtc = (withVideo: boolean): void => {
        if (user && socket) {
            const peer = new Peer(user.id, {
                host: process.env.REACT_APP_WEBRTC_ROUTE,
                port: parseInt(process.env.REACT_APP_WEBRTC_PORT || '4000'),
                path: '/peerjs',
                debug: process.env.NODE_ENV === 'development' ? 2 : 0
            });
            setWebRtcPeer(peer);

            getOurMediaStream(withVideo);

            console.log('we join web rtc');
        }
    };

    const leaveWebRtc = (): void => {
        if (webRtcPeer && socket && party) {
            if (user && mediaStreamsRef.current[user.id]) {
                mediaStreamsRef.current[user.id]
                    .getTracks()
                    .forEach(function (track) {
                        track.stop();
                    });
            }
            // Object.keys(callListRef.current).forEach((userId) => {
            //     hangUpOnUser(userId);
            // });
            webRtcPeer.destroy();
            setMediaStreams({});
            setCallList({});
            setWebRtcPeer(null);
            setOurMediaReady(false);
            socket.off('joinWebRtc');
            socket.off('leaveWebRtc');
            socket.emit('leaveWebRtc', {
                partyId: party.id
            });
            console.log('we leave & reset webrtc');
        }
    };

    const handleCall = useCallback(
        (call: any): void => {
            if (user) {
                console.log('other user calls us');
                call.answer(mediaStreamsRef.current[user.id]);
                console.log('we answer user id: ', call.peer);
                console.log('our stream: ', mediaStreamsRef.current[user.id]);
                console.log(
                    'our video tracks: ',
                    mediaStreamsRef.current[user.id].getVideoTracks()
                );
                setCallList({
                    ...callListRef.current,
                    [call.peer]: call
                });
                if (mediaStreamsRef.current) {
                    call.on('stream', (theirStream: MediaStream) => {
                        console.log(
                            'we get their stream, after they called us at our joining: ' +
                                call.peer
                        );
                        console.log(
                            'their video tracks: ',
                            theirStream.getVideoTracks()
                        );
                        console.log(
                            'their audio tracks: ',
                            theirStream.getAudioTracks()
                        );
                        setMediaStreams({
                            ...mediaStreamsRef.current,
                            [call.peer]: theirStream
                        });
                    });
                }
            }
        },
        [user]
    );

    const callUser = useCallback(
        (theirId: string, stream: MediaStream): void => {
            if (webRtcPeer && user) {
                const call = webRtcPeer.call(theirId, stream);
                console.log('call: ', call);
                console.log('mediaStreamsRef.current: ', stream);
                console.log('theirId:', theirId);
                console.log('we call other user, because they joined');
                setCallList({
                    ...callListRef.current,
                    [theirId]: call
                });
                call.on('stream', (theirStream) => {
                    console.log('we get theirStream: ', theirStream);
                    console.log(
                        'their video tracks: ',
                        theirStream.getVideoTracks()
                    );
                    console.log(
                        'their audio tracks: ',
                        theirStream.getAudioTracks()
                    );
                    setMediaStreams({
                        ...mediaStreamsRef.current,
                        [theirId]: theirStream
                    });
                });
                // call.on('close', () => {});
            }
        },
        [user, webRtcPeer]
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
        console.log('delete hung up users stream: ', newWebRtcStreams);
        setMediaStreams(newWebRtcStreams);
    }, []);

    // Handle RTC
    useEffect((): void => {
        console.log('We are in handleRtc()');
        console.log(webRtcPeer);
        if (webRtcPeer && ourMediaReady && user && party && socket) {
            webRtcPeer.on('call', handleCall);
            // Other user joins
            socket.on('joinWebRtc', (theirId: string) => {
                if (mediaStreamsRef.current) {
                    if (theirId !== user.id) {
                        console.log(
                            'SOCKET: other user joined webrtc: ',
                            theirId
                        );
                        callUser(theirId, mediaStreamsRef.current[user.id]);
                    }
                }
            });
            // Other user leaves
            socket.on('leaveWebRtc', (data: { userId: string }) => {
                const theirId = data.userId;
                console.log('left webrtc: ', theirId);
                console.log('callListRef.current', callListRef.current);
                hangUpOnUser(theirId);
            });

            // socket.on(
            //     'renegotiate',
            //     (data: {
            //         userId: string;
            //         localDescription: RTCSessionDescriptionInit;
            //     }) => {
            //         console.log('renegotiate incoming', data);
            //         const call = callListRef.current[data.userId];
            //         const peerConnection = call.peerConnection;
            //         peerConnection
            //             .setRemoteDescription(data.localDescription)
            //             .then(() => {
            //                 peerConnection.createAnswer().then((answer) => {
            //                     peerConnection
            //                         .setLocalDescription(answer)
            //                         .then(() => {
            //                             const answerData = {
            //                                 userId: user.id,
            //                                 localDescription:
            //                                     peerConnection.localDescription
            //                             };
            //                             console.log(
            //                                 'renegotiateAnswer emitted: ',
            //                                 answerData
            //                             );
            //                             socket.emit(
            //                                 'renegotiateAnswer',
            //                                 answerData
            //                             );
            //                         });
            //                 });
            //             });
            //     }
            // );

            // socket.on(
            //     'renegotiateAnswer',
            //     (data: {
            //         userId: string;
            //         localDescription: RTCSessionDescriptionInit;
            //     }) => {
            //         console.log('renegotiateAnswer incoming: ', data);
            //         const call = callListRef.current[data.userId];
            //         const peerConnection = call.peerConnection;
            //         peerConnection.setRemoteDescription(data.localDescription);
            //     }
            // );

            socket.emit('joinWebRtc', {
                userId: user.id,
                partyId: party.id
            });
        }
    }, [
        webRtcPeer,
        ourMediaReady,
        callUser,
        handleCall,
        hangUpOnUser,
        party,
        socket,
        user
    ]);

    const activateVideo = async (active: boolean) => {
        if (webRtcIsActive && user) {
            leaveWebRtc();

            const timeout = setTimeout(() => {
                joinWebRtc(active);
            }, 1000);

            return (): void => {
                clearTimeout(timeout);
            };

            // if (active) {
            //     const videoStream = await navigator.mediaDevices.getUserMedia({
            //         video: true
            //     });
            //     mediaStreams[user.id].addTrack(videoStream.getVideoTracks()[0]);
            //     Object.keys(callList).forEach((id) => {
            //         const call = callList[id];
            //         const peerConnection = call.peerConnection;
            //         console.log(peerConnection);
            //         peerConnection.createOffer().then((offer) => {
            //             console.log(offer);
            //             peerConnection.setLocalDescription(offer).then(() => {
            //                 const data = {
            //                     userId: user.id,
            //                     localDescription:
            //                         peerConnection.localDescription
            //                 };
            //                 console.log(
            //                     'renegotiate emitted from ' +
            //                         user.id +
            //                         'to' +
            //                         call.peer +
            //                         ': ',
            //                     data
            //                 );
            //                 socket?.emit('renegotiate', data);
            //             });
            //         });
            //     });
            // } else {
            //     mediaStreams[user.id].getVideoTracks()[0].stop();
            //     mediaStreams[user.id].removeTrack(
            //         mediaStreams[user.id].getVideoTracks()[0]
            //     );
            // }
        }
    };

    const toggleChat = (): void => {
        setChatIsActive(!chatIsActive);
    };

    const toggleWebRtc = (): void => {
        if (!webRtcIsActive) {
            joinWebRtc(false);
        } else {
            leaveWebRtc();
        }
        setWebRtcIsActive(!webRtcIsActive);
    };

    const toggleWebRtcVideo = (): void => {
        activateVideo(!webRtcVideoIsActive);
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
            {party && (
                <WebRtc
                    isActive={webRtcIsActive}
                    mediaStreams={mediaStreams}
                    mediaStreamsRef={mediaStreamsRef}
                ></WebRtc>
            )}
            {uiVisible && (
                <CommunicationBar
                    toggleChat={toggleChat}
                    toggleWebRtc={toggleWebRtc}
                    toggleWebRtcVideo={toggleWebRtcVideo}
                    chatIsActive={chatIsActive}
                    webRtcIsActive={webRtcIsActive}
                    uiVisible={uiVisible}
                    webRtcVideoIsActive={webRtcVideoIsActive}
                ></CommunicationBar>
            )}
        </>
    );
}
