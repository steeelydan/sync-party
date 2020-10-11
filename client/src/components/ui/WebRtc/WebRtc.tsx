import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowsAltH,
    faArrowsAltV,
    faUserAlt,
    faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';

interface Props {
    videoIsActive: boolean;
    mediaStreams: {
        [userId: string]: MediaStream;
    };
    mediaStreamsRef: React.MutableRefObject<{
        [userId: string]: MediaStream;
    }>;
    ourUserId: string | null;
}

export default function WebRtc({
    videoIsActive,
    mediaStreams,
    mediaStreamsRef,
    ourUserId
}: Props): ReactElement | null {
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    const { t } = useTranslation();

    const [displayOverlayMenu, setDisplayOverlayMenu] = useState(false);
    const [displayOwnVideo, setDisplayOwnVideo] = useState(true);
    const [displayVertically, setDisplayVertically] = useState(false);

    const displayedMediaStreams: {
        userId: string;
        mediaStream: MediaStream;
    }[] = [];

    let hasVideo = false;
    let otherVideosAmount = 0;

    if (ourUserId) {
        Object.keys(mediaStreams).forEach((userId) => {
            if (mediaStreams[userId].getVideoTracks().length) {
                hasVideo = true;
            }

            if (userId !== ourUserId) {
                otherVideosAmount++;
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
                {videoIsActive && memberStatus && ourUserId && (
                    <div className="mt-12 absolute top-0 left-0">
                        <Rnd
                            default={{
                                x: 0,
                                y: 0,
                                width: '50vh',
                                height: 'auto'
                            }}
                            resizeHandleStyles={{
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
                            <div
                                className={
                                    'flex' +
                                    (displayVertically
                                        ? ' flex-col'
                                        : ' flex-row')
                                }
                                onMouseOver={(): void =>
                                    setDisplayOverlayMenu(true)
                                }
                                onMouseLeave={(): void =>
                                    setDisplayOverlayMenu(false)
                                }
                            >
                                <div
                                    className={
                                        'absolute top-0 left-0 m-1 flex flex-row rounded px-2 py-1 bg-black opacity-75 eqa' +
                                        (displayOverlayMenu ? '' : ' hidden')
                                    }
                                    style={{ zIndex: 1000 }}
                                >
                                    <div
                                        className={
                                            'cursor-pointer z-50 w-6 flex' +
                                            (otherVideosAmount > 1
                                                ? ' mr-2'
                                                : '')
                                        }
                                        title={t(
                                            displayOwnVideo
                                                ? 'webRtc.toggleUserVideoOff'
                                                : 'webRtc.toggleUserVideoOn'
                                        )}
                                        onClick={(): void =>
                                            setDisplayOwnVideo(!displayOwnVideo)
                                        }
                                    >
                                        <FontAwesomeIcon
                                            className="mx-auto my-1"
                                            size="sm"
                                            icon={
                                                displayOwnVideo
                                                    ? faUserAltSlash
                                                    : faUserAlt
                                            }
                                        ></FontAwesomeIcon>
                                    </div>
                                    {otherVideosAmount > 1 && (
                                        <div
                                            className="cursor-pointer z-50 w-6 flex"
                                            title={t(
                                                displayVertically
                                                    ? 'webRtc.displayHorizontally'
                                                    : 'webRtc.displayVertically'
                                            )}
                                            onClick={(): void =>
                                                setDisplayVertically(
                                                    !displayVertically
                                                )
                                            }
                                        >
                                            <FontAwesomeIcon
                                                className="mx-auto my-1"
                                                icon={
                                                    displayVertically
                                                        ? faArrowsAltH
                                                        : faArrowsAltV
                                                }
                                            ></FontAwesomeIcon>
                                        </div>
                                    )}
                                </div>
                                {displayedMediaStreams.map((mediaStream) => {
                                    const isOwnVideo =
                                        mediaStream.userId === ourUserId;

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
                                                    'overflow-hidden bg-transparent rounded ' +
                                                    (displayVertically
                                                        ? 'mb-2'
                                                        : 'mr-2')
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
                                                        if (video) {
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
                {ourUserId && displayOwnVideo && (
                    <div
                        className="absolute top-0 left-0"
                        style={{
                            marginTop: displayVertically ? '80vh' : '45vh'
                        }}
                    >
                        <Rnd
                            default={{
                                x: 0,
                                y: 0,
                                width: '80',
                                height: 'auto'
                            }}
                            resizeHandleStyles={{
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
                                        mediaStream.userId === ourUserId;

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
                                                        if (video) {
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
    } else if (ourUserId) {
        return (
            <>
                {displayedMediaStreams.map((mediaStream) => {
                    return (
                        <audio
                            key={mediaStream.userId}
                            muted={mediaStream.userId === ourUserId}
                            ref={(audio): void => {
                                if (audio) {
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
