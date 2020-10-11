import React, { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComment,
    faMicrophone,
    faPhoneAlt,
    faVideo
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface Props {
    toggleChat: Function;
    toggleWebRtcAudio: Function;
    toggleWebRtcVideo: Function;
    chatIsActive: boolean;
    webRtcAudioIsActive: boolean;
    webRtcVideoIsActive: boolean;
    uiVisible: boolean;
    audioIsMuted: boolean;
    videoIsMuted: boolean;
    toggleAudioIsMuted: Function;
    toggleVideoIsMuted: Function;
}

export default function CommunicationBar({
    toggleChat,
    toggleWebRtcAudio,
    toggleWebRtcVideo,
    chatIsActive,
    webRtcAudioIsActive,
    webRtcVideoIsActive,
    uiVisible,
    audioIsMuted,
    videoIsMuted,
    toggleAudioIsMuted,
    toggleVideoIsMuted
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <div
            className={
                'absolute bottom-0 left-0 ml-3' +
                (uiVisible ? ' mb-12' : ' mb-3')
            }
        >
            <div className="flex flex-row">
                <div
                    className={
                        'w-8 h-8 flex cursor-pointer z-50 p-1 mt-2 ' +
                        (chatIsActive ? 'bg-purple-700' : 'bg-gray-800')
                    }
                    onClick={(): void => toggleChat()}
                    style={{ borderRadius: '100%' }}
                    title={chatIsActive ? t('chat.close') : t('chat.open')}
                >
                    <FontAwesomeIcon
                        className="m-auto"
                        opacity={chatIsActive ? 1 : 0.7}
                        icon={faComment}
                        size="1x"
                    ></FontAwesomeIcon>
                </div>
                {!webRtcVideoIsActive && (
                    <div
                        className={
                            'ml-2 w-8 h-8 flex cursor-pointer z-50 p-1 mt-2 ' +
                            (webRtcAudioIsActive
                                ? 'bg-purple-700'
                                : 'bg-gray-800')
                        }
                        onClick={(): void => toggleWebRtcAudio()}
                        style={{ borderRadius: '100%' }}
                        title={
                            webRtcAudioIsActive
                                ? t('webRtc.audioClose')
                                : t('webRtc.audioOpen')
                        }
                    >
                        <FontAwesomeIcon
                            className="m-auto"
                            opacity={webRtcAudioIsActive ? 1 : 0.7}
                            icon={faPhoneAlt}
                            size="1x"
                        ></FontAwesomeIcon>
                    </div>
                )}
                {!webRtcAudioIsActive && (
                    <div
                        className={
                            'ml-2 w-8 h-8 flex cursor-pointer z-50 p-1 mt-2 ' +
                            (webRtcVideoIsActive
                                ? 'bg-purple-700'
                                : 'bg-gray-800')
                        }
                        onClick={(): void => {
                            toggleWebRtcVideo();
                        }}
                        style={{ borderRadius: '100%' }}
                        title={
                            webRtcVideoIsActive
                                ? t('webRtc.videoClose')
                                : t('webRtc.videoOpen')
                        }
                    >
                        <FontAwesomeIcon
                            className="m-auto"
                            opacity={webRtcVideoIsActive ? 1 : 0.7}
                            icon={faVideo}
                            size="1x"
                        ></FontAwesomeIcon>
                    </div>
                )}
                {webRtcVideoIsActive && (
                    <div
                        className={
                            'ml-2 w-6 h-6 flex cursor-pointer z-50 p-1 mt-3 ' +
                            (!videoIsMuted ? 'bg-gray-400' : 'bg-gray-800')
                        }
                        onClick={(): void => toggleVideoIsMuted()}
                        style={{ borderRadius: '100%' }}
                        title={
                            webRtcAudioIsActive
                                ? t('webRtc.audioClose')
                                : t('webRtc.audioOpen')
                        }
                    >
                        <FontAwesomeIcon
                            className={
                                'm-auto' +
                                (videoIsMuted
                                    ? ' text-gray-200'
                                    : ' text-gray-800')
                            }
                            opacity={!videoIsMuted ? 1 : 0.7}
                            icon={faVideo}
                            size="xs"
                        ></FontAwesomeIcon>
                    </div>
                )}
                {(webRtcAudioIsActive || webRtcVideoIsActive) && (
                    <div
                        className={
                            'ml-2 w-6 h-6 flex cursor-pointer z-50 p-1 mt-3 ' +
                            (!audioIsMuted ? 'bg-gray-400' : 'bg-gray-800')
                        }
                        onClick={(): void => toggleAudioIsMuted()}
                        style={{ borderRadius: '100%' }}
                        title={
                            webRtcAudioIsActive
                                ? t('webRtc.audioClose')
                                : t('webRtc.audioOpen')
                        }
                    >
                        <FontAwesomeIcon
                            className={
                                'm-auto' +
                                (audioIsMuted
                                    ? ' text-gray-200'
                                    : ' text-gray-800')
                            }
                            opacity={!audioIsMuted ? 1 : 0.7}
                            icon={faMicrophone}
                            size="xs"
                        ></FontAwesomeIcon>
                    </div>
                )}
            </div>
        </div>
    );
}
