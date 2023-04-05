import { useTranslation } from 'react-i18next';
import { ButtonIcon } from '../../input/ButtonIcon/ButtonIcon';
import { Avatar } from '../../display/Avatar/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';

import type { ReactElement } from 'react';
import type {
    ClientParty,
    PartyMember,
    ClientUser
} from '../../../../../shared/types';

interface Props {
    user: ClientUser;
    userParty: ClientParty;
    handlePartyChoose: (userParty: ClientParty) => void;
    setRedirectToPartySettings: (partyId: string) => void;
}

export const PartyTile = ({
    user,
    userParty,
    handlePartyChoose,
    setRedirectToPartySettings
}: Props): ReactElement => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <div
            className="w-40 h-40 p-2 mr-2 my-2 bg-gray-800 hover:bg-gray-700 cursor-pointer"
            key={userParty.id}
            onClick={(): void => {
                if (userParty.status === 'active' || user.role === 'admin') {
                    handlePartyChoose(userParty);
                } else {
                    dispatch(
                        setGlobalState({
                            errorMessage: t(`errors.joinInactivePartyError`)
                        })
                    );
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
                {userParty.members.map((member: PartyMember) => {
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
};
