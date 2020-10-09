import React, {
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useSelector } from 'react-redux';
import Peer from 'peerjs';
import { Rnd } from 'react-rnd';

interface Props {
    isActive: boolean;
    socket: SocketIOClient.Socket | null;
    partyId: string;
    webRtcVideoIsActive: boolean;
}

export default function WebRtc({
    isActive,
    socket,
    partyId,
    webRtcVideoIsActive
}: Props): ReactElement | null {
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

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

    useEffect(() => {
        callListRef.current = callList;
        mediaStreamsRef.current = mediaStreams;
    }, [mediaStreams, callList]);

    // console.log('callList: ', callListRef.current);
    // console.log('mediaStreams: ', mediaStreamsRef.current);

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

            setOurMediaReady(true);
            console.log('our media is ready');
        }
    };

    const joinWebRtc = useCallback(
        (withVideo): void => {
            if (user && socket) {
                setWebRtcPeer(
                    new Peer(user.id, {
                        host: process.env.REACT_APP_WEBRTC_ROUTE,
                        port: parseInt(
                            process.env.REACT_APP_WEBRTC_PORT || '4000'
                        ),
                        path: '/peerjs',
                        debug: process.env.NODE_ENV === 'development' ? 1 : 0
                    })
                );

                getOurMediaStream(withVideo);

                console.log('we join web rtc');
            }
        },
        [socket, user]
    );

    const stopOwnMediaStreamTracks = (): void => {
        if (user && mediaStreamsRef.current[user.id]) {
            mediaStreamsRef.current[user.id]
                .getTracks()
                .forEach(function (track) {
                    track.stop();
                });
        }
    };

    const leaveWebRtc = useCallback((): void => {
        if (webRtcPeer && user && socket) {
            webRtcPeer.destroy();
            stopOwnMediaStreamTracks();
            setMediaStreams({});
            setCallList({});
            setWebRtcPeer(null);
            setOurMediaReady(false);
            socket.off('joinWebRtc');
            socket.off('leaveWebRtc');
            socket.emit('leaveWebRtc', {
                partyId: partyId
            });
            console.log('we leave & reset webrtc');
        }
    }, [socket, user, webRtcPeer, partyId]);

    useEffect((): void => {
        if (user && socket) {
            if (isActive) {
                joinWebRtc(false);
            } else {
                leaveWebRtc();
            }
        }
    }, [isActive]);

    // Disconnect webrtc if component unmounts -> user leaves party
    useEffect(() => {
        return (): void => {
            leaveWebRtc();
        };
    }, [leaveWebRtc]);

    const handleCall = (call: any): void => {
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
                        'we get their stream, after they called us at our joining'
                    );
                    console.log(
                        'video tracks from user: ' + call.peer,
                        theirStream.getVideoTracks()
                    );
                    setMediaStreams({
                        ...mediaStreamsRef.current,
                        [call.peer]: theirStream
                    });
                });
            }
        }
    };

    const callUser = (theirId: string, stream: MediaStream): void => {
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
            console.log(mediaStreamsRef.current);
            call.on('stream', (theirStream) => {
                console.log('we get theirStream: ', theirStream);
                console.log(
                    'their video tracks: ',
                    theirStream.getVideoTracks()
                );
                setMediaStreams({
                    ...mediaStreamsRef.current,
                    [theirId]: theirStream
                });
            });
            // call.on('close', () => {});
        }
    };

    const hangUpOnUser = (theirId: string): void => {
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
    };

    useEffect(() => {
        if (isActive && user && ourMediaReady) {
            if (webRtcPeer && user && socket) {
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
                    // FIXME: Why is the call gone at this point?
                    hangUpOnUser(theirId);
                });

                socket.emit('joinWebRtc', {
                    userId: user.id,
                    partyId: partyId
                });

                return (): void => {
                    socket?.off('joinWebRtc');
                    socket?.off('leaveWebRtc');
                    webRtcPeer?.off('call', handleCall);
                };
            }
        }
    }, [isActive, socket, user, webRtcPeer, ourMediaReady, partyId]);

    // Activate / deactivate video
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const toggleVideo = async (): Promise<void> => {
            if (user && isActive) {
                let withVideo: boolean;

                if (webRtcVideoIsActive) {
                    withVideo = true;
                } else {
                    withVideo = false;
                }

                if (webRtcPeer) {
                    leaveWebRtc();
                }

                timeout = setTimeout(() => {
                    joinWebRtc(withVideo);
                }, 1000);
            }
        };

        toggleVideo();

        return (): void => {
            clearTimeout(timeout);
        };
    }, [webRtcVideoIsActive]);

    const displayedMediaStreams: {
        userId: string;
        mediaStream: MediaStream;
    }[] = [];

    let hasVideo = false;
    let othersWithVideo = 0;

    if (user) {
        Object.keys(mediaStreams).forEach((userId) => {
            console.log(mediaStreams[userId].getAudioTracks());
            if (mediaStreams[userId].getVideoTracks().length) {
                hasVideo = true;
                if (userId !== user.id) {
                    othersWithVideo++;
                }
            }
            displayedMediaStreams.push({
                userId: userId,
                mediaStream: mediaStreams[userId]
            });
        });
    }

    if (hasVideo) {
        console.log(othersWithVideo);

        return (
            <div
                className={
                    'absolute top-0 left-0 ml-2' +
                    (uiVisible ? ' mb-20' : ' mb-10')
                }
            >
                {isActive && memberStatus && user && (
                    <div className="mt-12 absolute top-0 left-0">
                        <Rnd
                            default={{
                                x: 0,
                                y: 0,
                                width: '50vh',
                                height: 'auto'
                            }}
                            resizeHandleStyles={{
                                // right: {
                                //     display: 'block'
                                // },
                                bottomRight: { display: 'none' },
                                bottom: { display: 'none' },
                                bottomLeft: { display: 'none' },
                                left: { display: 'none' },
                                topLeft: { display: 'none' },
                                top: { display: 'none' },
                                topRight: { display: 'none' }
                            }}
                            className="bg-transparent-600 z-40"
                        >
                            <div className="flex flex-row">
                                {displayedMediaStreams.map((mediaStream) => {
                                    const isOwnVideo =
                                        mediaStream.userId === user.id;

                                    if (
                                        memberStatus[mediaStream.userId]
                                            .online &&
                                        mediaStream.mediaStream.getVideoTracks()
                                            .length &&
                                        !isOwnVideo
                                    ) {
                                        return (
                                            <div
                                                key={mediaStream.userId}
                                                className={
                                                    'overflow-hidden bg-transparent mr-2 rounded'
                                                }
                                                style={{
                                                    height: isOwnVideo
                                                        ? '100px'
                                                        : '100%',
                                                    width: isOwnVideo
                                                        ? '100px'
                                                        : '100%'
                                                }}
                                            >
                                                <video
                                                    muted={isOwnVideo}
                                                    className="min-w-full min-h-full overflow-hidden object-cover"
                                                    ref={(video): void => {
                                                        if (video && user) {
                                                            if (
                                                                video.srcObject !==
                                                                mediaStreamsRef
                                                                    .current[
                                                                    mediaStream
                                                                        .userId
                                                                ]
                                                            ) {
                                                                video.srcObject =
                                                                    mediaStreamsRef.current[
                                                                        mediaStream.userId
                                                                    ];
                                                            }
                                                        }
                                                    }}
                                                    onLoadedMetadata={(
                                                        event
                                                    ): void => {
                                                        event.currentTarget.play();
                                                    }}
                                                ></video>
                                            </div>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                            </div>
                        </Rnd>
                    </div>
                )}
                {user && (
                    <div
                        className="absolute top-0 left-0"
                        style={{ marginTop: '45vh' }}
                    >
                        <Rnd
                            default={{
                                x: 0,
                                y: 0,
                                width: '80',
                                height: 'auto'
                            }}
                            resizeHandleStyles={{
                                // right: {
                                //     display: 'block'
                                // },
                                bottomRight: { display: 'none' },
                                bottom: { display: 'none' },
                                bottomLeft: { display: 'none' },
                                left: { display: 'none' },
                                topLeft: { display: 'none' },
                                top: { display: 'none' },
                                topRight: { display: 'none' }
                            }}
                            className="bg-transparent-600"
                        >
                            <div className="flex flex-row">
                                {displayedMediaStreams.map((mediaStream) => {
                                    const isOwnVideo =
                                        mediaStream.userId === user.id;

                                    if (isOwnVideo) {
                                        return (
                                            <div
                                                key={mediaStream.userId}
                                                className={
                                                    'overflow-hidden bg-transparent mr-2 rounded'
                                                }
                                                style={{
                                                    height: '100%',
                                                    width: '100%',
                                                    minWidth: '30px'
                                                }}
                                            >
                                                <video
                                                    muted={isOwnVideo}
                                                    className="min-w-full min-h-full overflow-hidden object-cover"
                                                    ref={(video): void => {
                                                        if (video && user) {
                                                            if (
                                                                video.srcObject !==
                                                                mediaStreamsRef
                                                                    .current[
                                                                    mediaStream
                                                                        .userId
                                                                ]
                                                            ) {
                                                                video.srcObject =
                                                                    mediaStreamsRef.current[
                                                                        mediaStream.userId
                                                                    ];
                                                            }
                                                        }
                                                    }}
                                                    onLoadedMetadata={(
                                                        event
                                                    ): void => {
                                                        event.currentTarget.play();
                                                    }}
                                                ></video>
                                            </div>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}
                            </div>
                        </Rnd>
                    </div>
                )}
            </div>
        );
    } else if (user) {
        return (
            <>
                {displayedMediaStreams.map((mediaStream) => {
                    return (
                        <audio
                            key={mediaStream.userId}
                            muted={mediaStream.userId === user.id}
                            ref={(audio): void => {
                                if (audio && user) {
                                    if (
                                        audio.srcObject !==
                                        mediaStreamsRef.current[
                                            mediaStream.userId
                                        ]
                                    ) {
                                        audio.srcObject =
                                            mediaStreamsRef.current[
                                                mediaStream.userId
                                            ];
                                    }
                                }
                            }}
                            onLoadedMetadata={(event): void => {
                                event.currentTarget.play();
                            }}
                        ></audio>
                    );
                })}
            </>
        );
    } else {
        return null;
    }
}
