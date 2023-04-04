import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import RangeSlider from '../../input/RangeSlider/RangeSlider';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import Duration from '../../display/Duration/Duration';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPause,
    faPlay,
    faExpand,
    faCompress
} from '@fortawesome/free-solid-svg-icons';
import SyncStatus from '../SyncStatus/SyncStatus';

import type { MouseEventHandler, ChangeEventHandler } from 'react';
import type { PlayerState, RootAppState } from '../../../../../shared/types';

type Props = {
    playerState: PlayerState;
    handlePlayPause: MouseEventHandler<HTMLInputElement>;
    handleSeekMouseDown: React.MouseEventHandler<HTMLInputElement>;
    handleSeekChange: ChangeEventHandler;
    handleSeekMouseUp: React.MouseEventHandler<HTMLInputElement>;
    handleVolumeChange: ChangeEventHandler;
    handleFullScreen: MouseEventHandler;
};

export default function BottomBar({
    playerState,
    handlePlayPause,
    handleSeekMouseDown,
    handleSeekChange,
    handleSeekMouseUp,
    handleVolumeChange,
    handleFullScreen
}: Props): JSX.Element {
    const { t } = useTranslation();

    const party = useSelector((state: RootAppState) => state.globalState.party);
    const playingItem = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );
    const syncStatus = useSelector(
        (state: RootAppState) => state.globalState.syncStatus
    );
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );
    const position = useSelector(
        (state: RootAppState) => state.globalState.position
    );

    return (
        <div className="flex flex-col">
            <div className="w-full absolute bottom-0 pb-12 z-40 align-bottom flex flex-row justify-end">
                <SyncStatus
                    party={party}
                    playerState={playerState}
                    syncStatus={syncStatus}
                    memberStatus={memberStatus}
                    uiVisible={uiVisible}
                ></SyncStatus>
            </div>
            <div
                className={
                    'flex flex-row px-1 w-full absolute bottom-0 left-0 backgroundShade z-50' +
                    (playingItem && uiVisible ? '' : ' hidden')
                }
            >
                <ButtonIcon
                    title={playerState.isPlaying ? 'Pause' : 'Play'}
                    icon={
                        playerState.isPlaying ? (
                            <FontAwesomeIcon
                                size="lg"
                                icon={faPause}
                            ></FontAwesomeIcon>
                        ) : (
                            <FontAwesomeIcon
                                size="lg"
                                icon={faPlay}
                            ></FontAwesomeIcon>
                        )
                    }
                    onClick={handlePlayPause}
                    className="p-2"
                ></ButtonIcon>
                {playingItem && (
                    <RangeSlider
                        ariaLabel="Seek bar"
                        value={position}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        className={
                            'slider' +
                            (playerState.duration !== Infinity // Streams, e.g. online radio
                                ? ''
                                : ' invisible')
                        }
                    ></RangeSlider>
                )}
                <div className="mx-2 my-auto">
                    <Duration
                        className={
                            playerState.duration !== Infinity
                                ? ''
                                : ' invisible'
                        }
                        seconds={playerState.duration * position}
                    ></Duration>
                </div>
                <RangeSlider
                    ariaLabel="Volume Slider"
                    className={'slider slider-alt slider-small mr-2'}
                    onChange={handleVolumeChange}
                    value={playerState.volume}
                    width={'w-24'}
                ></RangeSlider>
                <div className="mr-2 my-auto">
                    <ButtonIcon
                        onClick={(
                            event: React.MouseEvent<HTMLInputElement>
                        ): void => {
                            handleFullScreen(event);
                        }}
                        title={t('common.fullscreen')}
                        icon={
                            <FontAwesomeIcon
                                className="text-gray-200 hover:text-purple-500"
                                icon={
                                    playerState.isFullScreen
                                        ? faCompress
                                        : faExpand
                                }
                                size="lg"
                            ></FontAwesomeIcon>
                        }
                    ></ButtonIcon>
                </div>
            </div>
        </div>
    );
}
