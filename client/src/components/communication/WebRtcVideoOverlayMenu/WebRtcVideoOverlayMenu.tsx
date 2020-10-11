import {
    faArrowsAltH,
    faArrowsAltV,
    faUserAlt,
    faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

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
                'absolute top-0 left-0 m-1 flex flex-row rounded px-2 py-1 bg-black opacity-75' +
                (isActive ? '' : ' hidden')
            }
            style={{ zIndex: 1000 }}
        >
            <div
                className={
                    'cursor-pointer z-50 w-6 flex' +
                    (otherVideosAmount > 1 ? ' mr-2' : '')
                }
                title={t(
                    displayOwnVideo
                        ? 'webRtc.toggleUserVideoOff'
                        : 'webRtc.toggleUserVideoOn'
                )}
                onClick={(): void => setDisplayOwnVideo(!displayOwnVideo)}
            >
                <FontAwesomeIcon
                    className="mx-auto my-1"
                    size="sm"
                    icon={displayOwnVideo ? faUserAltSlash : faUserAlt}
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
                        setDisplayVertically(!displayVertically)
                    }
                >
                    <FontAwesomeIcon
                        className="mx-auto my-1"
                        icon={displayVertically ? faArrowsAltH : faArrowsAltV}
                    ></FontAwesomeIcon>
                </div>
            )}
        </div>
    );
}
