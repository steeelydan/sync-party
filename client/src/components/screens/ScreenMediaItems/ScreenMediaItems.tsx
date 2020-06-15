import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';
import { axiosConfig, updateCurrentParty } from '../../../common/helpers';

import {
    getUpdatedUserItems,
    getUpdatedUserParties
} from '../../../common/requests';
import Heading from '../../display/Heading/Heading';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

type Props = {
    socket: SocketIOClient.Socket | null;
};

type IndexableMediaItem = {
    [index: string]: string;
};

export default function ScreenMediaItems({
    socket
}: Props): JSX.Element | null {
    const [redirect, setRedirect] = useState(false);
    const [allMediaItems, setAllMediaItems] = useState<MediaItem[] | null>(
        null
    );
    const [sortedMediaItems, setSortedMediaItems] = useState<
        MediaItem[] | null
    >(null);
    const [allUsers, setAllUsers] = useState<{ [id: string]: string }>();
    const [sorted, setSorted] = useState<{ [attribute: string]: boolean }>({});
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const userItems = useSelector(
        (state: RootAppState) => state.globalState.userItems
    );

    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                const fetchAllItems = async (): Promise<void> => {
                    try {
                        const response = await Axios.get(
                            process.env.REACT_APP_API_ROUTE + 'allMediaItems',
                            axiosConfig()
                        );

                        if (response.data.success === true) {
                            setAllMediaItems(response.data.allMediaItems);
                            setSortedMediaItems(response.data.allMediaItems);
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
                                errorMessage: t(`errors.itemFetchError`)
                            })
                        );
                    }
                };

                fetchAllItems();

                const fetchAllUsers = async (): Promise<void> => {
                    try {
                        const response = await Axios.get(
                            process.env.REACT_APP_API_ROUTE + 'allUsers',
                            axiosConfig()
                        );
                        if (response.data.success) {
                            const userRegister: { [id: string]: string } = {};
                            response.data.allUsers.forEach((user: User) => {
                                userRegister[user.id] = user.username;
                            });
                            setAllUsers(userRegister);
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
                                errorMessage: t(`errors.userFetchError`)
                            })
                        );
                    }
                };

                fetchAllUsers();
            } else {
                setAllMediaItems(userItems);
                setAllUsers({});
            }
        }
    }, [userItems, user, dispatch, t]);

    const handleDeleteButton = async (itemId: string): Promise<void> => {
        if (socket) {
            try {
                const response = await Axios.delete(
                    process.env.REACT_APP_API_ROUTE + 'mediaItem/' + itemId,
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
                        socket.emit('partyUpdate', { partyId: party.id });
                    }

                    await getUpdatedUserItems(dispatch, t);

                    socket.emit('mediaItemUpdate', {});
                }
            } catch (error) {
                setGlobalState({
                    errorMessage: t('errors.deleteItemError')
                });
            }
        }
    };

    const handleSort = async (
        event: React.MouseEvent<Element, MouseEvent>
    ): Promise<void> => {
        const attribute = (event.target as HTMLTableRowElement).id;

        if (!sorted[attribute]) {
            setSortedMediaItems(
                [...allMediaItems].sort(
                    (a: IndexableMediaItem, b: IndexableMediaItem) => {
                        return a[attribute] < b[attribute] ? -1 : 1;
                    }
                )
            );

            setSorted({ [attribute]: true });
        } else {
            setSortedMediaItems(allMediaItems);
            setSorted({ [attribute]: false });
        }
    };

    if (redirect) {
        return <Redirect push to="/"></Redirect>;
    }

    return sortedMediaItems &&
        sortedMediaItems.length > 0 &&
        allUsers &&
        user ? (
        <div className="bg-black p-4">
            <div className="flex flex-row justify-between">
                <Heading
                    className="mb-5"
                    size={2}
                    text={
                        user.role === 'admin'
                            ? t('mediaItems.headingAdmin')
                            : t('mediaItems.headingUser')
                    }
                ></Heading>
                <ButtonIcon
                    className="p-1"
                    color="text-gray-200"
                    title={t('common.close')}
                    icon={
                        <FontAwesomeIcon
                            icon={faTimes}
                            size="lg"
                        ></FontAwesomeIcon>
                    }
                    onClick={(): void => setRedirect(true)}
                ></ButtonIcon>
            </div>

            <div className="text-xs">
                <table className="select-text w-full">
                    <thead>
                        <tr className="border-b border-gray-700 text-left">
                            <th
                                id="name"
                                onClick={(event): void => {
                                    handleSort(event);
                                }}
                                className="cursor-pointer py-3 pr-3"
                            >
                                {t('mediaItems.name')}
                            </th>
                            {user.role === 'admin' && (
                                <>
                                    <th
                                        id="type"
                                        onClick={(event): void => {
                                            handleSort(event);
                                        }}
                                        className="cursor-pointer pr-3"
                                    >
                                        {t('mediaItems.type')}
                                    </th>
                                    <th
                                        id="owner"
                                        onClick={(event): void => {
                                            handleSort(event);
                                        }}
                                        className="cursor-pointer pr-3"
                                    >
                                        {t('mediaItems.owner')}
                                    </th>
                                </>
                            )}
                            <th
                                id="url"
                                onClick={(event): void => {
                                    handleSort(event);
                                }}
                                className="cursor-pointer pr-3"
                            >
                                {t('mediaItems.url')}
                            </th>
                            {user.role === 'admin' && (
                                <th
                                    id="id"
                                    onClick={(event): void => {
                                        handleSort(event);
                                    }}
                                    className="cursor-pointer pr-3"
                                >
                                    {t('mediaItems.id')}
                                </th>
                            )}
                            <th
                                id="createdAt"
                                onClick={(event): void => {
                                    handleSort(event);
                                }}
                                className="cursor-pointer pr-3"
                            >
                                {t('mediaItems.createdAt')}
                            </th>
                            {user.role === 'admin' && (
                                <th
                                    id="updatedAt"
                                    onClick={(event): void => {
                                        handleSort(event);
                                    }}
                                    className="cursor-pointer pr-3"
                                >
                                    {t('mediaItems.updatedAt')}
                                </th>
                            )}
                            <th className="pr-4">{t('mediaItems.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(allUsers).length &&
                            sortedMediaItems.map((mediaItem) => {
                                return (
                                    <tr
                                        key={mediaItem.id}
                                        className="border-b border-gray-700"
                                    >
                                        <td className="pr-3 py-3">
                                            {mediaItem.name}
                                        </td>
                                        {user.role === 'admin' && allUsers && (
                                            <>
                                                <td className="pr-3">
                                                    {mediaItem.type}
                                                </td>
                                                <td className="pr-3">
                                                    {allUsers[mediaItem.owner]}
                                                </td>
                                            </>
                                        )}
                                        <td className="pr-3">
                                            {user.role === 'admin'
                                                ? mediaItem.url
                                                : mediaItem.type === 'file'
                                                ? mediaItem.url.substr(37)
                                                : mediaItem.url}
                                        </td>
                                        {user.role === 'admin' && (
                                            <td className="pr-3">
                                                {mediaItem.id}
                                            </td>
                                        )}
                                        <td className="pr-3">
                                            {moment(mediaItem.createdAt).format(
                                                'YYYY-MM-DD, HH:mm'
                                            )}
                                        </td>
                                        {user.role === 'admin' && (
                                            <td className="pr-3">
                                                {moment(
                                                    mediaItem.updatedAt
                                                ).format('YYYY-MM-DD, HH:mm')}
                                            </td>
                                        )}
                                        <td className="pr-3">
                                            <div className="flex flex-row">
                                                <ButtonIcon
                                                    className="m-auto"
                                                    color="text-gray-200"
                                                    title={t(
                                                        'mediaItems.delete'
                                                    )}
                                                    icon={
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        ></FontAwesomeIcon>
                                                    }
                                                    onClick={(): Promise<
                                                        void
                                                    > =>
                                                        handleDeleteButton(
                                                            mediaItem.id
                                                        )
                                                    }
                                                ></ButtonIcon>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    ) : null;
}
