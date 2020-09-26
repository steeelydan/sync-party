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

    const { t } = useTranslation();

    // Display updated actionMessage when updated in global state
    useEffect(() => {
        if (actionMessage && actionMessage.text) {
            if (props.playerTimeoutState.actionMessageTimeout) {
                clearTimeout(props.playerTimeoutState.actionMessageTimeout);
            }

            props.setPlayerTimeoutState({
                actionMessageTimeoutDone: false,
                actionMessageTimeout: setTimeout(() => {
                    props.setPlayerTimeoutState({
                        actionMessageTimeoutDone: true
                    });
                }, props.actionMessageDelay)
            });
        }

        return (): void => {
            if (props.playerTimeoutState.actionMessageTimeout) {
                clearTimeout(props.playerTimeoutState.actionMessageTimeout);
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
            {displayItemTitle && (
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
                        <div className="mt-12 mx-auto mb-auto py-2 px-3 rounded backgroundShade">
                            {actionMessage.text}
                        </div>
                    </div>
                )}
            {(props.playerState.isSyncing || props.playerState.isBuffering) && (
                <div className="flex w-full h-full absolute">
                    <div
                        className={
                            'mr-auto mb-auto mt-8 py-2 px-3 rounded backgroundShade' +
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
