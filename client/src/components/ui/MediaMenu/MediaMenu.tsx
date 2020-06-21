import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';
import { axiosConfig, reorderItems } from '../../../common/helpers';
import { getUpdatedUserItems } from '../../../common/requests';

import {
    DragDropContext,
    Droppable,
    DropResult,
    DroppableProvided
} from 'react-beautiful-dnd';

import ItemListed from '../ItemListed/ItemListed';
import AddMedia from '../AddMedia/AddMedia';
import MediaMenuDraggable from '../MediaMenuDraggable/MediaMenuDraggable';

type Props = {
    socket: SocketIOClient.Socket | null;
    setPlayerFocused: Function;
    emitPlayWish: Function;
    freezeUiVisible: Function;
    isPlaying: boolean;
    playerState: PlayerState;
};

export default function MediaMenu({
    socket,
    setPlayerFocused,
    emitPlayWish,
    freezeUiVisible,
    isPlaying,
    playerState
}: Props): JSX.Element {
    const party: ClientParty | null = useSelector(
        (state: RootAppState) => state.globalState.party
    );
    const playingItem: MediaItem | null = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleRemoveItemFromParty = async (
        item: MediaItem
    ): Promise<void> => {
        if (socket && party) {
            if (
                playerState.playingItem &&
                playerState.playingItem.id === item.id
            ) {
                dispatch(
                    setGlobalState({
                        errorMessage: t(`errors.removeLastItemError`)
                    })
                );

                return Promise.reject();
            }

            try {
                const response = await Axios.delete(
                    process.env.REACT_APP_API_ROUTE + 'partyItems',
                    {
                        data: { itemId: item.id, partyId: party.id },
                        ...axiosConfig()
                    }
                );

                if (response.data.success) {
                    const currentIndex = playerState.playlistIndex;

                    if (
                        playerState.playingItem &&
                        playerState.playingItem.id === item.id
                    ) {
                        emitPlayWish(
                            party.items[
                                currentIndex < party.items.length - 1
                                    ? currentIndex + 1
                                    : currentIndex - 1
                            ],
                            playerState.isPlaying,
                            0
                        );
                    }

                    socket.emit('partyUpdate', {
                        partyId: party.id
                    });

                    setPlayerFocused(true);
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
                        errorMessage: t(`errors.removeItemError`)
                    })
                );
            }
        }
    };

    const handleItemEditSave = async (item: MediaItem): Promise<void> => {
        if (socket && party) {
            try {
                const response = await Axios.put(
                    process.env.REACT_APP_API_ROUTE + 'mediaItem/' + item.id,
                    item,
                    axiosConfig()
                );

                if (response.data.success) {
                    await getUpdatedUserItems(dispatch, t);

                    socket.emit('partyUpdate', { partyId: party.id });
                    setPlayerFocused(true);
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
                        errorMessage: t(`errors.itemSaveError`)
                    })
                );
            }
        }
    };

    const handleItemClick = (chosenItem: MediaItem): void => {
        if (party) {
            const newSource = party.items.filter((mediaItem: MediaItem) => {
                return mediaItem.id === chosenItem.id;
            })[0];

            emitPlayWish(newSource, true, 0);
        }
    };

    const onDragEnd = async (result: DropResult): Promise<void> => {
        if (socket && party) {
            // Dropped outside the list
            if (!result.destination) {
                return;
            }

            const orderedItems = reorderItems(
                party.items,
                result.source.index,
                result.destination.index
            );

            try {
                const response = await Axios.put(
                    process.env.REACT_APP_API_ROUTE + 'partyItems',
                    { orderedItems: orderedItems, partyId: party.id },
                    axiosConfig()
                );

                if (response.data.success) {
                    socket.emit('partyUpdate', { partyId: party.id });
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
                        errorMessage: t(`errors.reorderError`)
                    })
                );
            }
        }
    };

    return (
        <div
            className={
                'mediaMenu fixed top-0 right-0 flex flex-col mt-16 p-2 border border-gray-500 rounded m-2 shadow-md backgroundShade' +
                (uiVisible || !playingItem || !playingItem.url ? '' : ' hidden')
            }
            onMouseOver={(): void => freezeUiVisible(true)}
            onMouseLeave={(): void => freezeUiVisible(false)}
        >
            {party && party.items.length ? (
                <div className="partyItemList">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided: DroppableProvided): JSX.Element => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {party.items.map(
                                        (
                                            mediaItem: MediaItem,
                                            index: number
                                        ) => {
                                            const isCurrentlyPlayingItem =
                                                playingItem &&
                                                playingItem.id === mediaItem.id
                                                    ? true
                                                    : false;
                                            const alreadyPlayed =
                                                party.metadata.played &&
                                                party.metadata.played[
                                                    mediaItem.id
                                                ]
                                                    ? true
                                                    : false;

                                            return (
                                                <MediaMenuDraggable
                                                    key={mediaItem.id}
                                                    mediaItemId={mediaItem.id}
                                                    index={index}
                                                >
                                                    <ItemListed
                                                        item={mediaItem}
                                                        isPlaying={isPlaying}
                                                        isCurrentlyPlayingItem={
                                                            isCurrentlyPlayingItem
                                                        }
                                                        alreadyPlayed={
                                                            alreadyPlayed
                                                        }
                                                        nameEditingAllowed={
                                                            false
                                                        }
                                                        handleItemClick={(): void =>
                                                            handleItemClick(
                                                                mediaItem
                                                            )
                                                        }
                                                        onRemoveButtonClick={(
                                                            item: MediaItem
                                                        ): void => {
                                                            handleRemoveItemFromParty(
                                                                item
                                                            );
                                                        }}
                                                        handleItemSave={(
                                                            item: MediaItem
                                                        ): void => {
                                                            handleItemEditSave(
                                                                item
                                                            );
                                                        }}
                                                        setPlayerFocused={
                                                            setPlayerFocused
                                                        }
                                                    ></ItemListed>
                                                </MediaMenuDraggable>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            ) : (
                <div className="mb-2">There&#39;s nothing.</div>
            )}
            <AddMedia
                handleItemEditSave={handleItemEditSave}
                setPlayerFocused={(focused: boolean): void =>
                    setPlayerFocused(focused)
                }
                socket={socket}
            ></AddMedia>
        </div>
    );
}
