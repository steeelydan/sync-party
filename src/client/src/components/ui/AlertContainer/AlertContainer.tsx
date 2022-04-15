import { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import { useTranslation } from 'react-i18next';
import Alert from '../../display/Alert/Alert';
import Button from '../../input/Button/Button';
import {
    MediaItem,
    PlayerState,
    RootAppState
} from '../../../../../shared/types';

interface Props {
    playerState: PlayerState;
    emitPlayWish: (
        mediaItem: MediaItem,
        isPlaying: boolean,
        lastPositionItemId: string | null,
        requestLastPosition: boolean,
        newPosition?: number,
        noIssuer?: boolean,
        direction?: 'left' | 'right'
    ) => void;
    hasLastPosition: boolean;
    setHasLastPosition: (hasLastPosition: boolean) => void;
}

export default function AlertContainer({
    playerState,
    emitPlayWish,
    hasLastPosition,
    setHasLastPosition
}: Props): ReactElement {
    const errorMessage = useSelector(
        (state: RootAppState) => state.globalState.errorMessage
    );

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const closeErrorMessage = (): void => {
        dispatch(setGlobalState({ errorMessage: '' }));
    };

    return (
        <>
            {errorMessage && (
                <div className="flex w-full h-full absolute z-50">
                    <div className="mt-32 mx-auto mb-auto">
                        <Alert
                            mode="error"
                            text={errorMessage}
                            onCloseButton={closeErrorMessage}
                        ></Alert>
                    </div>
                </div>
            )}
            {hasLastPosition &&
                !(playerState.isSyncing || playerState.isBuffering) &&
                playerState.playOrder &&
                playerState.playOrder.lastPosition &&
                playerState.playOrder.lastPosition.position > 0 && (
                    <div className="flex w-full h-full absolute bg-transparent">
                        <div className="mt-32 mx-auto mb-auto py-2 px-3 rounded backgroundShade z-50">
                            <div className="mb-3">
                                {t('alerts.continueFromLastPosition')}
                            </div>
                            <div className="flex flex-row justify-center">
                                <Button
                                    className="mr-3"
                                    onClick={(): void => {
                                        if (
                                            playerState.playingItem &&
                                            playerState.playOrder &&
                                            playerState.playOrder.lastPosition
                                        )
                                            emitPlayWish(
                                                playerState.playingItem,
                                                playerState.isPlaying,
                                                null,
                                                false,
                                                playerState.playOrder
                                                    .lastPosition.position
                                            );

                                        setHasLastPosition(false);
                                    }}
                                    text={t('alerts.yes')}
                                />
                                <Button
                                    onClick={(): void => {
                                        setHasLastPosition(false);
                                    }}
                                    text={t('alerts.no')}
                                />
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}
