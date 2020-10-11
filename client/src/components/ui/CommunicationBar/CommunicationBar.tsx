import React, { ReactElement } from 'react';
import {
    faComment,
    faMicrophone,
    faPhoneAlt,
    faVideo
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import BarButton from '../../input/BarButton/BarButton';

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
                <BarButton
                    isActive={chatIsActive}
                    clickHandler={toggleChat}
                    icon={faComment}
                    titleText={chatIsActive ? t('chat.close') : t('chat.open')}
                    size="large"
                />
                {!webRtcVideoIsActive && (
                    <BarButton
                        isActive={webRtcAudioIsActive}
                        clickHandler={toggleWebRtcAudio}
                        icon={faPhoneAlt}
                        titleText={
                            webRtcAudioIsActive
                                ? t('webRtc.audioClose')
                                : t('webRtc.audioOpen')
                        }
                        size="large"
                    />
                )}
                {!webRtcAudioIsActive && (
                    <BarButton
                        isActive={webRtcVideoIsActive}
                        clickHandler={toggleWebRtcVideo}
                        icon={faVideo}
                        titleText={
                            webRtcVideoIsActive
                                ? t('webRtc.videoClose')
                                : t('webRtc.videoOpen')
                        }
                        size="large"
                    />
                )}
                {webRtcVideoIsActive && (
                    <BarButton
                        isActive={!videoIsMuted}
                        clickHandler={toggleVideoIsMuted}
                        titleText={
                            videoIsMuted
                                ? t('webRtc.unmuteVideo')
                                : t('webRtc.muteVideo')
                        }
                        icon={faVideo}
                        size="small"
                    />
                )}
                {(webRtcAudioIsActive || webRtcVideoIsActive) && (
                    <BarButton
                        isActive={!audioIsMuted}
                        clickHandler={toggleAudioIsMuted}
                        titleText={
                            audioIsMuted
                                ? t('webRtc.unmuteAudio')
                                : t('webRtc.muteAudio')
                        }
                        icon={faMicrophone}
                        size="small"
                    />
                )}
            </div>
        </div>
    );
}
