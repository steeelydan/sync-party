import {
    faArrowsAltV,
    faCompress,
    faExpand,
    faUserAlt,
    faUserAltSlash
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import { BarButton } from '../../input/BarButton/BarButton';

import type { ReactElement } from 'react';
import type { RootAppState } from '../../../../../shared/types';

interface Props {
    isActive: boolean;
    displayVertically: boolean;
    setDisplayVertically: (displayVertically: boolean) => void;
    displayOwnVideo: boolean;
    setDisplayOwnVideo: (displayOwnVideo: boolean) => void;
    otherVideosAmount: number;
}

export const WebRtcVideoOverlayMenu = ({
    isActive,
    displayVertically,
    setDisplayVertically,
    displayOwnVideo,
    setDisplayOwnVideo,
    otherVideosAmount
}: Props): ReactElement => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const webRtcState = useSelector(
        (state: RootAppState) => state.globalState.webRtc
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    return (
        <div
            className={
                'absolute top-0 left-0 flex flex-row rounded p-1 bg-black opacity-75' +
                (uiVisible && (isActive || webRtcState.isFullscreen)
                    ? ''
                    : ' hidden') +
                (webRtcState.isFullscreen ? ' ml-1 mt-8' : ' m-1')
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
                margins="mt-0 mr-2"
            />
            <BarButton
                size="small"
                isActive={webRtcState.isFullscreen || false}
                clickHandler={(): void => {
                    dispatch(
                        setGlobalState({
                            webRtc: {
                                ...webRtcState,
                                isFullscreen: !webRtcState.isFullscreen
                            }
                        })
                    );
                }}
                icon={webRtcState.isFullscreen ? faCompress : faExpand}
                titleText={t('webRtc.fullscreen')}
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
};
