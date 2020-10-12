import {
    faArrowsAltV,
    faUserAlt,
    faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import BarButton from '../../input/BarButton/BarButton';

interface Props {
    isActive: boolean;
    displayVertically: boolean;
    setDisplayVertically: Function;
    displayOwnVideo: boolean;
    setDisplayOwnVideo: Function;
    otherVideosAmount: number;
}

export default function WebRtcVideoOverlayMenu({
    isActive,
    displayVertically,
    setDisplayVertically,
    displayOwnVideo,
    setDisplayOwnVideo,
    otherVideosAmount
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <div
            className={
                'absolute top-0 left-0 m-1 flex flex-row rounded p-1 bg-black opacity-75' +
                (isActive ? '' : ' hidden')
            }
            style={{ zIndex: 1000 }}
        >
            <BarButton
                size="small"
                isActive={displayOwnVideo}
                clickHandler={(): void => setDisplayOwnVideo(!displayOwnVideo)}
                icon={displayOwnVideo ? faUserAlt : faUserAltSlash}
                titleText={t(
                    displayOwnVideo
                        ? 'webRtc.toggleUserVideoOff'
                        : 'webRtc.toggleUserVideoOn'
                )}
                margins={'mt-0' + (otherVideosAmount > 1 ? ' mr-2' : '')}
            />
            {otherVideosAmount > 1 && (
                <BarButton
                    size="small"
                    isActive={displayVertically}
                    clickHandler={(): void =>
                        setDisplayVertically(!displayVertically)
                    }
                    icon={faArrowsAltV}
                    titleText={t(
                        displayVertically
                            ? 'webRtc.displayHorizontally'
                            : 'webRtc.displayVertically'
                    )}
                    margins={'mt-0'}
                />
            )}
        </div>
    );
}
