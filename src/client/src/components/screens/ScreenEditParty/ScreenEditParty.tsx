import { useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Heading } from '../../display/Heading/Heading';
import { ButtonIcon } from '../../input/ButtonIcon/ButtonIcon';
import { EditParty } from '../../ui/EditParty/EditParty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import type { Socket } from 'socket.io-client';
import type { ClientParty, RootAppState } from '../../../../../shared/types';

type Props = {
    socket: Socket | null;
};

type Location = {
    state: {
        referrer: string;
    };
};
export const ScreenEditParty = (props: Props): JSX.Element | null => {
    const [redirectBack, setRedirectBack] = useState(false);
    const location = useLocation() as Location;
    const params = useParams();
    const { t } = useTranslation();

    const partyId = params.id;
    const userParties = useSelector(
        (state: RootAppState) => state.globalState.userParties
    );
    const party = userParties
        ? userParties.find((userParty: ClientParty) => userParty.id === partyId)
        : null;
    const user = useSelector((state: RootAppState) => state.globalState.user);

    if (redirectBack) {
        if (!location || !location.state || !location.state.referrer) {
            return <Navigate to={`/`}></Navigate>;
        } else {
            return party ? (
                <Navigate
                    to={`${location.state.referrer}${party.id}`}
                ></Navigate>
            ) : (
                <></>
            );
        }
    }

    return party && user && user.role === 'admin' ? (
        <div className="flex flex-col container">
            <div className="flex flex-row justify-between">
                <Heading
                    className="mb-5"
                    size={2}
                    text={`${t('common.party')}: ${party.name}`}
                ></Heading>
                <ButtonIcon
                    className="p-1"
                    color="text-gray-200"
                    title="Close"
                    icon={
                        <FontAwesomeIcon
                            icon={faTimes}
                            size="lg"
                        ></FontAwesomeIcon>
                    }
                    onClick={(): void => setRedirectBack(true)}
                ></ButtonIcon>
            </div>
            <EditParty
                socket={props.socket}
                party={party}
                user={user}
            ></EditParty>
        </div>
    ) : null;
};
