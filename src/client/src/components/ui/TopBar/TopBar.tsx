import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Avatars from '../../display/Avatars/Avatars';
import TitleDisplay from '../TitleDisplay/TitleDisplay';
import EditParty from '../EditParty/EditParty';
import AdminActionOverlay from '../AdminActionOverlay/AdminActionOverlay';

import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Socket } from 'socket.io-client';
import { RootAppState } from '../../../../../shared/types';

type Props = {
    socket: Socket | null;
};

export default function TopBar({ socket }: Props): JSX.Element {
    const [editPartyOverlay, setEditPartyOverlay] = useState(false);
    const [redirect, setRedirect] = useState<'home' | ''>('');

    const user = useSelector((state: RootAppState) => state.globalState.user);
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    const { t } = useTranslation();

    if (party && redirect !== '') {
        if (redirect === 'home' && socket) {
            return <Navigate to="/"></Navigate>;
        }
    }

    return (
        <div className="absolute left-0 top-0 w-screen flex flex-row z-50 textShadow">
            <div className="flex-1">
                <TitleDisplay></TitleDisplay>
            </div>
            <div className="flex flex-1">
                {uiVisible && party && user && (
                    <div className="mx-auto flex flex-row">
                        <div
                            className="p-1 hover:text-gray-100 cursor-pointer mr-3"
                            onClick={(): void => setRedirect('home')}
                        >
                            <FontAwesomeIcon
                                className="iconShadow"
                                title={t('player.backToDashboardTitle')}
                                icon={faHome}
                            ></FontAwesomeIcon>
                        </div>
                        <span
                            className={
                                'mr-3 mt-1' +
                                (user.role === 'admin' ? ' cursor-pointer' : '')
                            }
                            onClick={(): void => {
                                user.role === 'admin' &&
                                    setEditPartyOverlay(true);
                            }}
                            title={t('player.goToPartyTitle')}
                        >
                            {party.name}
                        </span>
                        {party.status === 'stopped' && (
                            <span className="my-auto pt-1 text-xs text-red-600">
                                {party.status}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-1">
                <div className="ml-auto">
                    <Avatars></Avatars>
                </div>
            </div>
            {editPartyOverlay && party && user && socket && (
                <AdminActionOverlay
                    heading={`${t('common.party')}: ${party.name}`}
                    onClose={(): void => setEditPartyOverlay(false)}
                >
                    <EditParty
                        party={party}
                        user={user}
                        socket={socket}
                    ></EditParty>
                </AdminActionOverlay>
            )}
        </div>
    );
}
