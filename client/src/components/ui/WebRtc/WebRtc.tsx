import React, {
    ReactElement,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Peer from 'peerjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

interface Props {
    socket: SocketIOClient.Socket | null;
}

export default function WebRtc({ socket }: Props): ReactElement {
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    const { t } = useTranslation();

    const [isActive, setIsActive] = useState(false);
    const [webRtcPeer, setWebRtcPeer] = useState<Peer | null>(null);
    const [ourMediaReady, setOurMediaReady] = useState(false);

    const [mediaStreams, setMediaStreams] = useState<{
        [userId: string]: MediaStream;
    }>({});
    const mediaStreamsRef = useRef(mediaStreams);

    const [callList, setCallList] = useState<{ [userId: string]: any }>({});
    const callListRef = useRef(callList);

    useEffect(() => {
        callListRef.current = callList;
        mediaStreamsRef.current = mediaStreams;
    }, [mediaStreams, callList]);

    // console.log('callList: ', callListRef.current);
    // console.log('mediaStreams: ', mediaStreamsRef.current);

    const joinWebRtc = useCallback((): void => {
        if (user && socket && party) {
            setWebRtcPeer(
                new Peer(user.id, {
                    host: 'localhost',
                    port: 4000,
                    path: '/peerjs',
                    debug: process.env.NODE_ENV === 'development' ? 1 : 0
                })
            );
            socket.emit('joinWebRtc', {
                userId: user.id,
                partyId: party.id
            });
            setIsActive(true);
            console.log('we join web rtc');
        }
    }, [party, socket, user]);

    const leaveWebRtc = useCallback((): void => {
        if (webRtcPeer && user && party && socket) {
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
            socket.emit('leaveWebRtc', {
                partyId: party.id
            });
            setIsActive(false);
            console.log('we leave & reset webrtc');
        }
    }, [party, socket, user, webRtcPeer]);

    const toggleWebRtc = (): void => {
        if (user && party && socket) {
            if (!isActive) {
                joinWebRtc();
            } else {
                leaveWebRtc();
            }
        }
    };

    // Disconnect webrtc if component unmounts -> user leaves party
    useEffect(() => {
        return (): void => {
            leaveWebRtc();
        };
    }, [leaveWebRtc]);

    useEffect(() => {
        if (isActive && user) {
            if (webRtcPeer && user && socket) {
                webRtcPeer.on('call', (call) => {
                    console.log('other user calls us');
                    setCallList({ ...callListRef.current, [call.peer]: call });
                    if (mediaStreamsRef.current) {
                        call.on('stream', (theirStream) => {
                            console.log(
                                'we get their stream, after they called us at our joining'
                            );
                            setMediaStreams({
                                ...mediaStreamsRef.current,
                                [call.peer]: theirStream
                            });
                        });
                    }
                });

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
                    console.log('callList', callList);
                    console.log('callListRef.current', callListRef.current);
                    console.log('call: ', callListRef.current[theirId]);
                    callListRef.current[theirId].close();
                    const newCallList = { ...callListRef.current };
                    delete newCallList[theirId];
                    setCallList(newCallList);
                    const newWebRtcStreams = { ...mediaStreamsRef.current };
                    delete newWebRtcStreams[theirId];
                    setMediaStreams(newWebRtcStreams);
                });
            }

            const getVideoAndAudio = async (): Promise<void> => {
                const ourStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                setMediaStreams({
                    ...mediaStreamsRef.current,
                    [user.id]: ourStream
                });

                setOurMediaReady(true);
                console.log('our media is ready');
            };

            getVideoAndAudio();
        }
    }, [isActive, callList, socket, user, webRtcPeer]);

    useEffect(() => {
        if (ourMediaReady && user && mediaStreamsRef.current[user.id]) {
            Object.keys(callList).forEach((userId) => {
                const call = callList[userId];
                call.answer(mediaStreamsRef.current[user.id]);
                console.log('we answer user id: ', userId);
            });
        }
    }, [ourMediaReady, callList, user]);

    return (
        <div
            className={
                'absolute bottom-0 left-0 ml-10 z-50' +
                (uiVisible ? ' mb-12' : ' mb-3')
            }
        >
            {isActive && memberStatus && (
                <div className="flex flex-row">
                    {Object.keys(mediaStreams).map((userId) => {
                        return (
                            memberStatus[userId].online && (
                                <div
                                    key={userId}
                                    className="w-20 h-20 overflow-hidden bg-transparent mr-2"
                                    style={{ borderRadius: '100%' }}
                                >
                                    <video
                                        muted
                                        className="min-w-full min-h-full overflow-hidden object-cover"
                                        ref={(video): void => {
                                            if (video && user) {
                                                if (
                                                    video.srcObject !==
                                                    mediaStreamsRef.current[
                                                        userId
                                                    ]
                                                ) {
                                                    video.srcObject =
                                                        mediaStreamsRef.current[
                                                            userId
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
                </div>
            )}
            {uiVisible && (
                <FontAwesomeIcon
                    className="cursor-pointer mt-3"
                    onClick={toggleWebRtc}
                    opacity={isActive ? 1 : 0.7}
                    icon={faVideo}
                    size="lg"
                    title={isActive ? t('webRtc.close') : t('webRtc.open')}
                ></FontAwesomeIcon>
            )}
        </div>
    );
}
