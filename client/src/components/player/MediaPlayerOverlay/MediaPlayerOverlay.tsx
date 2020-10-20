import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { testMediaType } from '../../../common/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

type Props = {
    playerState: PlayerState;
    playerTimeoutState: PlayerTimeoutState;
    setPlayerTimeoutState: Function;
    actionMessageDelay: number;
};

export default function MediaPlayerOverlay(props: Props): JSX.Element {
    const actionMessage = useSelector(
        (state: RootAppState) => state.globalState.actionMessage
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );
    const webRtcGlobalState = useSelector(
        (state: RootAppState) => state.globalState.webRtc
    );

    const { t } = useTranslation();

    // Display updated actionMessage when updated in global state
    useEffect(() => {
        if (actionMessage && actionMessage.text) {
            if (props.playerTimeoutState.actionMessageTimeoutId) {
                clearTimeout(props.playerTimeoutState.actionMessageTimeoutId);
            }

            props.setPlayerTimeoutState({
                actionMessageTimeoutDone: false,
                actionMessageTimeoutId: setTimeout(() => {
                    props.setPlayerTimeoutState({
                        actionMessageTimeoutDone: true
                    });
                }, props.actionMessageDelay)
            });
        }

        return (): void => {
            if (props.playerTimeoutState.actionMessageTimeoutId) {
                clearTimeout(props.playerTimeoutState.actionMessageTimeoutId);
            }
        };
    }, [actionMessage]);

    const displayItemTitle = props.playerState.playingItem
        ? testMediaType(props.playerState.playingItem.url) === 'audio'
            ? true
            : false
        : true;

    return (
        <>
            {displayItemTitle && !webRtcGlobalState.isFullscreen && (
                <div className="flex w-full h-full absolute">
                    <div className="m-auto p-auto">
                        {props.playerState.playingItem ? (
                            props.playerState.playingItem.name
                        ) : (
                            <div className="flex-col text-center">
                                <p className="mb-2">{t('player.greeting')}</p>
                                <p>{t('player.greetingText')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {actionMessage &&
                actionMessage.text &&
                !props.playerTimeoutState.actionMessageTimeoutDone && (
                    <div className="flex w-full h-full absolute">
                        <div className="mt-12 mx-auto mb-auto py-2 px-3 rounded backgroundShade z-50">
                            {actionMessage.text}
                        </div>
                    </div>
                )}
            {(props.playerState.isSyncing || props.playerState.isBuffering) && (
                <div className="flex w-full h-full absolute">
                    <div
                        className={
                            'ml-2 mr-auto mb-auto mt-8 py-2 px-3 rounded backgroundShade z-50' +
                            (uiVisible ? ' mb-12' : ' mb-2')
                        }
                    >
                        <FontAwesomeIcon
                            icon={faSync}
                            size="lg"
                            spin
                        ></FontAwesomeIcon>
                    </div>
                </div>
            )}
        </>
    );
}
