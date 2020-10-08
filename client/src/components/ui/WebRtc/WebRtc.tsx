import React, {
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useSelector } from 'react-redux';
import Peer from 'peerjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

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
}: Props): ReactElement {
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

    const [callList, setCallList] = useState<{ [userId: string]: any }>({});
    const callListRef = useRef(callList);

    const [viewMode, setViewMode] = useState<'small' | 'large'>('small');

    const displayOwnVideo = true;

    useEffect(() => {
        callListRef.current = callList;
        mediaStreamsRef.current = mediaStreams;
    }, [mediaStreams, callList]);

    // console.log('callList: ', callListRef.current);
    // console.log('mediaStreams: ', mediaStreamsRef.current);

    const joinWebRtc = useCallback((): void => {
        if (user && socket) {
            setWebRtcPeer(
                new Peer(user.id, {
                    host: process.env.REACT_APP_WEBRTC_ROUTE,
                    port: parseInt(process.env.REACT_APP_WEBRTC_PORT || '4000'),
                    path: '/peerjs',
                    debug: process.env.NODE_ENV === 'development' ? 1 : 0
                })
            );

            const getOurMediaStream = async (): Promise<void> => {
                const ourStream = await navigator.mediaDevices.getUserMedia({
                    video: false,
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
            };

            getOurMediaStream();

            console.log('we join web rtc');
        }
    }, [socket, user]);

    const leaveWebRtc = useCallback((): void => {
        if (webRtcPeer && user && socket) {
            webRtcPeer.destroy();
            if (mediaStreamsRef.current[user.id]) {
                mediaStreamsRef.current[user.id]
                    .getTracks()
                    .forEach(function (track) {
                        track.stop();
                    });
            }
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
                joinWebRtc();
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

    // Activate / deactivate video
    useEffect(() => {
        const getNewMediaStream = async (): Promise<void> => {
            if (user) {
                if (webRtcVideoIsActive) {
                    mediaStreams[
                        user.id
                    ] = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: {
                            autoGainControl: true
                        }
                    });
                } else {
                    mediaStreams[
                        user.id
                    ] = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: {
                            autoGainControl: true
                        }
                    });
                }
            }
        };
        getNewMediaStream();
    }, [webRtcVideoIsActive]);

    useEffect(() => {
        if (isActive && user && ourMediaReady) {
            if (webRtcPeer && user && socket) {
                const handleCall = (call: any): void => {
                    console.log('other user calls us');
                    call.answer(mediaStreamsRef.current[user.id]);
                    console.log('we answer user id: ', call.peer);
                    setCallList({ ...callListRef.current, [call.peer]: call });
                    if (mediaStreamsRef.current) {
                        call.on('stream', (theirStream: any) => {
                            console.log(
                                'we get their stream, after they called us at our joining'
                            );
                            setMediaStreams({
                                ...mediaStreamsRef.current,
                                [call.peer]: theirStream
                            });
                        });
                    }
                };

                webRtcPeer.on('call', handleCall);

                socket.on('joinWebRtc', (theirId: string) => {
                    if (mediaStreamsRef.current) {
                        if (theirId !== user.id) {
                            console.log(
                                'SOCKET: other user joined webrtc: ',
                                theirId
                            );
                            const call = webRtcPeer.call(
                                theirId,
                                mediaStreamsRef.current[user.id]
                            );
                            console.log('call: ', call);
                            console.log(
                                'mediaStreamsRef.current: ',
                                mediaStreamsRef.current[user.id]
                            );
                            console.log('theirId:', theirId);
                            console.log(
                                'we call other user, because they joined'
                            );
                            setCallList({
                                ...callListRef.current,
                                [theirId]: call
                            });
                            console.log(mediaStreamsRef.current);
                            call.on('stream', (theirStream) => {
                                console.log(
                                    'we get theirStream: ',
                                    theirStream
                                );
                                setMediaStreams({
                                    ...mediaStreamsRef.current,
                                    [theirId]: theirStream
                                });
                            });
                            // call.on('close', () => {});
                        }
                    }
                });

                socket.on('leaveWebRtc', (data: { userId: string }) => {
                    const theirId = data.userId;
                    console.log('left webrtc: ', theirId);
                    console.log('callListRef.current', callListRef.current);
                    // FIXME: Why is the call gone at this point?
                    if (callListRef.current[theirId]) {
                        callListRef.current[theirId].close();
                        const newCallList = { ...callListRef.current };
                        delete newCallList[theirId];
                        setCallList(newCallList);
                    }
                    const newWebRtcStreams = { ...mediaStreamsRef.current };
                    delete newWebRtcStreams[theirId];
                    setMediaStreams(newWebRtcStreams);
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

    const displayedMediaStreams: {
        userId: string;
        mediaStream: MediaStream;
    }[] = [];
    if (user) {
        Object.keys(mediaStreams).forEach((userId) => {
            if (userId !== user.id || displayOwnVideo) {
                displayedMediaStreams.push({
                    userId: userId,
                    mediaStream: mediaStreams[userId]
                });
            }
        });
    }

    return (
        <div
            className={
                'absolute top-0 left-0 ml-2' + (uiVisible ? ' mb-20' : ' mb-10')
            }
        >
            {isActive && memberStatus && user && (
                <div className="flex flex-row absolute top-0 left-0 mt-12">
                    {displayedMediaStreams.map((mediaStream) => {
                        return (
                            memberStatus[mediaStream.userId].online && (
                                <div
                                    key={mediaStream.userId}
                                    className={
                                        'overflow-hidden bg-transparent mr-2 rounded ' +
                                        (viewMode === 'small'
                                            ? 'rtcVideoSizeSmall'
                                            : 'rtcVideoSizeLarge')
                                    }
                                >
                                    <video
                                        muted={mediaStream.userId === user.id}
                                        className="min-w-full min-h-full overflow-hidden object-cover"
                                        ref={(video): void => {
                                            if (video && user) {
                                                if (
                                                    video.srcObject !==
                                                    mediaStreamsRef.current[
                                                        mediaStream.userId
                                                    ]
                                                ) {
                                                    video.srcObject =
                                                        mediaStreamsRef.current[
                                                            mediaStream.userId
                                                        ];
                                                }
                                            }
                                        }}
                                        onLoadedMetadata={(event): void => {
                                            event.currentTarget.play();
                                        }}
                                    ></video>
                                </div>
                            )
                        );
                    })}
                    {displayedMediaStreams.length ? (
                        <div>
                            <FontAwesomeIcon
                                className="cursor-pointer"
                                icon={
                                    viewMode === 'small'
                                        ? faPlusCircle
                                        : faMinusCircle
                                }
                                onClick={(): void => {
                                    setViewMode(
                                        viewMode === 'small' ? 'large' : 'small'
                                    );
                                }}
                            ></FontAwesomeIcon>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
