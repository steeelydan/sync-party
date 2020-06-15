import React, { ReactElement, useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';

import Heading from '../../display/Heading/Heading';
import ButtonLink from '../../input/ButtonLink/ButtonLink';

interface Props {
    party: ClientParty;
    user: User;
    socket: SocketIOClient.Socket | null;
}

export default function EditParty({
    party,
    user,
    socket
}: Props): ReactElement {
    const [allUsers, setAllUsers] = useState([]);
    const [redirect, setRedirect] = useState(false);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (user && user.role === 'admin') {
            const fetchAllUsers = async (): Promise<void> => {
                try {
                    const response = await Axios.get(
                        process.env.REACT_APP_API_ROUTE + 'allUsers',
                        axiosConfig()
                    );

                    setAllUsers(response.data.allUsers);
                } catch (error) {
                    dispatch(
                        setGlobalState({
                            errorMessage: t(`errors.userFetchError`)
                        })
                    );

                    return Promise.reject(error);
                }
            };

            fetchAllUsers();
        }
    }, [user, dispatch, t]);

    const handleAddMember = async (
        addedMember: ClientPartyMember
    ): Promise<void> => {
        if (party) {
            const newMembers = [...party.members, addedMember];

            editParty({
                ...party,
                members: newMembers
            });
        }
    };

    const handleRemoveMember = (removedMember: ClientPartyMember): void => {
        if (party) {
            const newMembers = party.members.filter(
                (partyMember: ClientPartyMember) => {
                    return partyMember.id !== removedMember.id;
                }
            );

            editParty({
                ...party,
                members: newMembers
            });
        }
    };

    const editParty = async (
        updatedParty: ClientParty,
        deleteParty = false
    ): Promise<void> => {
        if (socket && party) {
            const formattedParty: ServerParty = {
                ...updatedParty,
                members: updatedParty.members.map((member) => member.id)
            };

            try {
                const response = await Axios.put(
                    process.env.REACT_APP_API_ROUTE + 'party/',
                    { party: formattedParty, deleteParty },
                    axiosConfig()
                );

                if (response.status === 200) {
                    socket.emit('partyUpdate', { partyId: party.id });

                    if (deleteParty) {
                        setRedirect(true);
                    }
                } else {
                    dispatch(
                        setGlobalState({
                            errorMessage: t(
                                `apiResponseMessages.${response.data.msg}`
                            )
                        })
                    );
                }

                return Promise.resolve();
            } catch (error) {
                dispatch(
                    setGlobalState({
                        errorMessage: t(`errors.editPartyError`)
                    })
                );

                return Promise.reject(error);
            }
        } else {
            return Promise.reject();
        }
    };

    if (redirect) {
        return <Redirect to="/"></Redirect>;
    }

    return (
        <>
            <Heading
                className="mb-3"
                size={3}
                text={t('editParty.heading')}
            ></Heading>
            <div className="mb-4">
                <div>
                    {party.status === 'active' && (
                        <ButtonLink
                            padding="pb-2"
                            onClick={(): void => {
                                editParty({ ...party, status: 'stopped' });
                            }}
                            text={t('editParty.stopParty')}
                        ></ButtonLink>
                    )}
                    {party.status === 'stopped' && (
                        <ButtonLink
                            padding="pb-2"
                            onClick={(): void => {
                                editParty({ ...party, status: 'active' });
                            }}
                            text={t('editParty.resumeParty')}
                        ></ButtonLink>
                    )}
                </div>
                <div>
                    <ButtonLink
                        padding="pb-2"
                        className="text-red-600 hover:text-red-400"
                        onClick={(): void => {
                            editParty({ ...party, status: 'stopped' }, true);
                        }}
                        text={t('editParty.deleteParty')}
                    ></ButtonLink>
                </div>
            </div>

            <Heading
                className="mb-3"
                size={3}
                text={t('editParty.headingEditMembers')}
            ></Heading>
            <div className="flex flex-row mb-4">
                <div className="flex-1">
                    <div className="mb-2">{t('editParty.headingMembers')}:</div>
                    <div>
                        {user &&
                            party.members
                                .filter(
                                    (member: ClientPartyMember) =>
                                        member.id !== user.id
                                )
                                .map((member: ClientPartyMember) => {
                                    return (
                                        <div key={member.id}>
                                            <ButtonLink
                                                key={member.username}
                                                text={member.username}
                                                padding={'py-1'}
                                                onClick={(): void => {
                                                    handleRemoveMember(member);
                                                }}
                                            ></ButtonLink>
                                        </div>
                                    );
                                })}
                    </div>
                </div>
                <div className="flex-1 w-auto">
                    <div className="mb-2">
                        {t('editParty.headingNonMembers')}:
                    </div>
                    <div className="">
                        {allUsers
                            .filter((user: User) => {
                                return !party.members.find(
                                    (member: ClientPartyMember) => {
                                        return member.id === user.id;
                                    }
                                );
                            })
                            .map((member: ClientPartyMember) => {
                                return (
                                    <div key={member.username}>
                                        <ButtonLink
                                            padding={'py-1'}
                                            text={member.username}
                                            key={member.username}
                                            onClick={(): Promise<void> =>
                                                handleAddMember(member)
                                            }
                                        ></ButtonLink>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </>
    );
}
