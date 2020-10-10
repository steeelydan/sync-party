import React, { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComment,
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
}

export default function CommunicationBar({
    toggleChat,
    toggleWebRtcAudio,
    toggleWebRtcVideo,
    chatIsActive,
    webRtcAudioIsActive,
    webRtcVideoIsActive,
    uiVisible
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
                >
                    <FontAwesomeIcon
                        className="m-auto"
                        opacity={chatIsActive ? 1 : 0.7}
                        icon={faComment}
                        size="1x"
                        title={chatIsActive ? t('chat.close') : t('chat.open')}
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
                    >
                        <FontAwesomeIcon
                            className="m-auto"
                            opacity={webRtcAudioIsActive ? 1 : 0.7}
                            icon={faPhoneAlt}
                            size="1x"
                            title={
                                webRtcAudioIsActive
                                    ? t('webRtc.close')
                                    : t('webRtc.open')
                            }
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
                    >
                        <FontAwesomeIcon
                            className="m-auto"
                            opacity={webRtcVideoIsActive ? 1 : 0.7}
                            icon={faVideo}
                            size="1x"
                            title={
                                webRtcVideoIsActive
                                    ? t('webRtc.close')
                                    : t('webRtc.open')
                            }
                        ></FontAwesomeIcon>
                    </div>
                )}
            </div>
        </div>
    );
}
