import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientParty, User, ClientPartyMember } from '../../../types';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import Avatar from '../../display/Avatar/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

interface Props {
    user: User;
    userParty: ClientParty;
    handlePartyChoose: Function;
    setRedirectToPartySettings: Function;
}

export default function PartyTile({
    user,
    userParty,
    handlePartyChoose,
    setRedirectToPartySettings
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <div
            className="w-40 h-40 p-2 mr-2 my-2 bg-gray-900 hover:bg-gray-800 cursor-pointer"
            key={userParty.id}
            onClick={(): void => {
                if (userParty.status === 'active' || user.role === 'admin') {
                    handlePartyChoose(userParty);
                }
            }}
            title={t('dashboard.partyTileTitle')}
        >
            <div className="flex flex-row justify-between">
                <div
                    className={
                        'mb-1 text-xs' +
                        (userParty.status === 'active'
                            ? ' text-green-500'
                            : ' text-red-600')
                    }
                >
                    {userParty.status === 'active'
                        ? t('common.statusActive')
                        : t('common.statusStopped')}
                </div>
                {user.role === 'admin' && (
                    <div>
                        <ButtonIcon
                            color="text-gray-200 z-50"
                            icon={
                                <FontAwesomeIcon icon={faCog}></FontAwesomeIcon>
                            }
                            title={t('dashboard.editPartyTitle')}
                            onClick={(event): void => {
                                event.stopPropagation();
                                setRedirectToPartySettings(userParty.id);
                            }}
                        ></ButtonIcon>
                    </div>
                )}
            </div>
            <div className="mb-1">{userParty.name}</div>
            <div className="flex flex-row flex-wrap">
                {userParty.members.map((member: ClientPartyMember) => {
                    return (
                        <Avatar
                            key={member.username}
                            size={8}
                            fontSize={'text-sm'}
                            username={member.username}
                            user={user}
                        ></Avatar>
                    );
                })}
            </div>
        </div>
    );
}
