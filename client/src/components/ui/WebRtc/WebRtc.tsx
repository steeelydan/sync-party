import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

interface Props {
    isActive: boolean;
    mediaStreams: {
        [userId: string]: MediaStream;
    };
    mediaStreamsRef: React.MutableRefObject<{
        [userId: string]: MediaStream;
    }>;
}

export default function WebRtc({
    isActive,
    mediaStreams,
    mediaStreamsRef
}: Props): ReactElement | null {
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    console.log(
        Object.keys(mediaStreamsRef.current).map((userId) => {
            const stream = mediaStreamsRef.current[userId];
            return {
                userId: userId,
                video: stream.getVideoTracks(),
                audio: stream.getAudioTracks()
            };
        })
    );

    const displayedMediaStreams: {
        userId: string;
        mediaStream: MediaStream;
    }[] = [];

    let hasVideo = false;

    if (user) {
        Object.keys(mediaStreams).forEach((userId) => {
            if (
                mediaStreams[userId].getVideoTracks().length &&
                userId !== user.id
            ) {
                hasVideo = true;
            }
            displayedMediaStreams.push({
                userId: userId,
                mediaStream: mediaStreams[userId]
            });
        });
    }

    if (hasVideo) {
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
