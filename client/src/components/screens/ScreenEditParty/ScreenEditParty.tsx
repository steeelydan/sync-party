import React, { useState } from 'react';
import { useLocation, useParams, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ClientParty, RootAppState } from '../../../types';
import Heading from '../../display/Heading/Heading';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import EditParty from '../../ui/EditParty/EditParty';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type Props = {
    socket: SocketIOClient.Socket | null;
};

export default function ScreenEditParty(props: Props): JSX.Element | null {
    const [redirectBack, setRedirectBack] = useState(false);
    const location: any = useLocation(); // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41674
    const params: {
        id: string;
    } = useParams();
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
            return <Redirect push to={`/`}></Redirect>;
        } else {
            return party ? (
                <Redirect
                    push
                    to={`${location.state.referrer}${party.id}`}
                ></Redirect>
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
}
