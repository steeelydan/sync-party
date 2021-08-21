import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';

import Axios from 'axios';
import {
    axiosConfig,
    updateCurrentParty,
    noPartyState
} from '../../../common/helpers';
import { useTranslation } from 'react-i18next';

import { getUpdatedUserParties } from '../../../common/requests';
import InputText from '../../input/InputText/InputText';
import Heading from '../../display/Heading/Heading';
import Button from '../../input/Button/Button';
import Alert from '../../display/Alert/Alert';
import PartyTile from '../../ui/PartyTile/PartyTile';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHdd } from '@fortawesome/free-solid-svg-icons';
import { Socket } from 'socket.io-client';

type Props = {
    socket: Socket | null;
};

export default function ScreenDashboard(props: Props): JSX.Element | null {
    const [redirectToParty, setRedirectToParty] = useState('');
    const [redirectToUser, setRedirectToUser] = useState(false);
    const [redirectToMediaItems, setRedirectToMediaItems] = useState(false);
    const [redirectToPartySettings, setRedirectToPartySettings] = useState('');
    const [partyName, setPartyName] = useState('');
    const userParties = useSelector(
        (state: RootAppState) => state.globalState.userParties
    );
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const errorMessage = useSelector(
        (state: RootAppState) => state.globalState.errorMessage
    );
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (props.socket && party && !redirectToParty) {
            props.socket.emit('leaveParty', { partyId: party.id });
            dispatch(setGlobalState(noPartyState));
        }
    }, [props.socket, party, dispatch, redirectToParty]);

    const handleCreateParty = async (
        event: React.MouseEvent
    ): Promise<void> => {
        event.preventDefault();

        try {
            const response = await Axios.post(
                process.env.REACT_APP_API_ROUTE + 'party',
                { partyName: partyName },
                axiosConfig()
            );
            if (response.data.success) {
                const updatedUserParties = await getUpdatedUserParties(
                    dispatch,
                    t
                );
                if (party) {
                    await updateCurrentParty(
                        dispatch,
                        updatedUserParties,
                        party
                    );
                }
                setPartyName('');
            } else {
                dispatch(
                    setGlobalState({
                        errorMessage: t(
                            `apiResponseMessages.${response.data.msg}`
                        )
                    })
                );
            }
        } catch (error) {
            dispatch(
                setGlobalState({
                    errorMessage: t(`errors.partyCreationError`)
                })
            );
            return Promise.reject(error);
        }
    };

    const handlePartyChoose = (userParty: ClientParty): void => {
        dispatch(setGlobalState({ party: userParty }));
        setRedirectToParty(userParty.id);
    };

    if (redirectToParty !== '') {
        return <Redirect push to={'/party/' + redirectToParty}></Redirect>;
    }

    if (redirectToPartySettings !== '') {
        return (
            <Redirect
                push
                to={'/editParty/' + redirectToPartySettings}
            ></Redirect>
        );
    }

    if (redirectToUser) {
        return <Redirect push to={'/user'}></Redirect>;
    }

    if (redirectToMediaItems) {
        return <Redirect push to={'/mediaItems'}></Redirect>;
    }

    return (
        <>
            <div className="flex flex-col">
                {user && (
                    <div className="w-full flex flex-row justify-end">
                        <div className="mx-2 mt-1 mb-3">
                            <div
                                className="cursor-pointer"
                                onClick={(): void => setRedirectToUser(true)}
                                title={t('common.userLinkTitle')}
                            >
                                <FontAwesomeIcon
                                    icon={faUser}
                                    size="sm"
                                ></FontAwesomeIcon>{' '}
                                {user.username}
                            </div>
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <div className="w-full absolute">
                        <div className="mx-auto mt-4 max-w-lg">
                            <Alert
                                className="w-full"
                                mode="error"
                                text={errorMessage}
                                onCloseButton={(): void => {
                                    dispatch(
                                        setGlobalState({ errorMessage: '' })
                                    );
                                }}
                            ></Alert>
                        </div>
                    </div>
                )}
                {user && (
                    <div className="m-auto max-w-lg">
                        {user.role === 'admin' && (
                            <form>
                                <div className="flex flex-row mb-5">
                                    <div>
                                        <InputText
                                            containerClassName="w-full"
                                            label={
                                                t('dashboard.newParty') + ':'
                                            }
                                            labelWidth="w-32"
                                            placeholder={t('common.name')}
                                            value={partyName}
                                            onChange={(
                                                event: React.ChangeEvent<
                                                    HTMLInputElement
                                                >
                                            ): void =>
                                                setPartyName(event.target.value)
                                            }
                                        ></InputText>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="ml-3 mb-3 w-24"
                                        text={t('dashboard.createParty')}
                                        onClick={handleCreateParty}
                                    ></Button>
                                </div>
                            </form>
                        )}
                        <div className="m-auto pb-12 mt-3">
                            <div className="flex flex-row">
                                <Heading
                                    size={3}
                                    text={t('dashboard.yourParties')}
                                ></Heading>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4 flex-wrap">
                                {userParties ? (
                                    userParties.map(
                                        (userParty: ClientParty) => {
                                            return (
                                                <PartyTile
                                                    key={userParty.id}
                                                    user={user}
                                                    userParty={userParty}
                                                    handlePartyChoose={
                                                        handlePartyChoose
                                                    }
                                                    setRedirectToPartySettings={
                                                        setRedirectToPartySettings
                                                    }
                                                ></PartyTile>
                                            );
                                        }
                                    )
                                ) : (
                                    <div>{t('dashboard.noParties')}</div>
                                )}
                            </div>
                            <Button
                                className="w-40"
                                text={
                                    <span>
                                        <FontAwesomeIcon
                                            icon={faHdd}
                                            size="lg"
                                            className="mr-3"
                                        ></FontAwesomeIcon>
                                        {user.role === 'admin'
                                            ? t('dashboard.allMedia')
                                            : t('dashboard.yourMedia')}
                                    </span>
                                }
                                onClick={(): void =>
                                    setRedirectToMediaItems(true)
                                }
                            ></Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
