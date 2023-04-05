import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import { useTranslation } from 'react-i18next';
import Axios from 'axios';
import { axiosConfig, reorderItems } from '../../../common/helpers';
import { getUpdatedUserItems } from '../../../common/requests';

import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { ItemListed } from '../ItemListed/ItemListed';
import { AddMedia } from '../AddMedia/AddMedia';
import { MediaMenuDraggable } from '../MediaMenuDraggable/MediaMenuDraggable';

import type { Socket } from 'socket.io-client';
import type { DropResult, DroppableProvided } from 'react-beautiful-dnd';
import type {
    ClientParty,
    IMediaItem,
    PlayerState,
    RootAppState
} from '../../../../../shared/types';

type Props = {
    socket: Socket | null;
    setPlayerFocused: (focused: boolean) => void;
    emitPlayWish: (
        mediaItem: IMediaItem,
        isPlaying: boolean,
        lastPositionItemId: string | null,
        requestLastPosition: boolean,
        newPosition?: number,
        noIssuer?: boolean,
        direction?: 'left' | 'right'
    ) => void;
    freezeUiVisible: (freezeUiVisible: boolean) => void;
    isPlaying: boolean;
    playerState: PlayerState;
};

export const MediaMenu = ({
    socket,
    setPlayerFocused,
    emitPlayWish,
    freezeUiVisible,
    isPlaying,
    playerState
}: Props): JSX.Element => {
    const party: ClientParty | null = useSelector(
        (state: RootAppState) => state.globalState.party
    );
    const playingItem: IMediaItem | null = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );
    const uiFocused = useSelector(
        (state: RootAppState) => state.globalState.uiFocused
    );

    const [hoverTimestamp, setHoverTimestamp] = useState(0);
    const hoverTimestampRef = useRef(hoverTimestamp);

    const [addMediaIsActive, setAddMediaIsActive] = useState(false);

    const [partyItemsSet, setPartyItemsSet] = useState<Set<string>>(new Set());

    const partyItemListRef = useRef<HTMLDivElement | null>(null);

    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        hoverTimestampRef.current = hoverTimestamp;
    });

    // Collect items in active party in a set for faster checks
    useEffect(() => {
        if (party) {
            const itemsSet = new Set<string>();

            party.items.forEach((item) => {
                itemsSet.add(item.id);
            });

            setPartyItemsSet(itemsSet);
        }
    }, [party]);

    const handleRemoveItemFromParty = async (
        item: IMediaItem
    ): Promise<void> => {
        if (socket && party) {
            if (
                party.items.length === 1 &&
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
                const response = await Axios.delete('/api/partyItems', {
                    data: { itemId: item.id, partyId: party.id },
                    ...axiosConfig()
                });

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
                            null,
                            false,
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

    const handleItemEditSave = async (item: IMediaItem): Promise<void> => {
        if (socket && party) {
            try {
                const response = await Axios.put(
                    '/api/mediaItem/' + item.id,
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

    const handleItemClick = (chosenItem: IMediaItem): void => {
        if (party) {
            const newSource = party.items.filter((mediaItem: IMediaItem) => {
                return mediaItem.id === chosenItem.id;
            })[0];

            emitPlayWish(
                newSource,
                true,
                playerState.playingItem ? playerState.playingItem.id : null,
                true,
                0
            );
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
                    '/api/partyItems',
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
                'mediaMenu fixed top-0 right-0 flex flex-col mt-16 p-2 border border-gray-500 rounded m-2 shadow-md backgroundShade z-50' +
                (uiVisible || !playingItem || !playingItem.url ? '' : ' hidden')
            }
            onMouseOver={(): void => {
                const now = Date.now();

                if (hoverTimestampRef.current + 10000 < now) {
                    // console.log('uiVisible set as TRUE');
                    freezeUiVisible(true);
                    setHoverTimestamp(now);
                }
            }}
            onMouseLeave={(): void => {
                if (!uiFocused.chat && !addMediaIsActive) {
                    // console.log('uiVisible set as FALSE');
                    freezeUiVisible(false);
                    setHoverTimestamp(0);
                }
            }}
        >
            {party && party.items.length ? (
                <div className="partyItemList" ref={partyItemListRef}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided: DroppableProvided): JSX.Element => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {party.items.map(
                                        (
                                            mediaItem: IMediaItem,
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
                                                            item: IMediaItem
                                                        ): void => {
                                                            handleRemoveItemFromParty(
                                                                item
                                                            );
                                                        }}
                                                        handleItemSave={(
                                                            item: IMediaItem
                                                        ): void => {
                                                            handleItemEditSave(
                                                                item
                                                            );
                                                        }}
                                                        setPlayerFocused={
                                                            setPlayerFocused
                                                        }
                                                        partyItemListRef={
                                                            partyItemListRef
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
                isActive={addMediaIsActive}
                partyItemsSet={partyItemsSet}
                setAddMediaIsActive={setAddMediaIsActive}
                handleItemEditSave={handleItemEditSave}
                setPlayerFocused={(focused: boolean): void =>
                    setPlayerFocused(focused)
                }
                socket={socket}
            ></AddMedia>
        </div>
    );
};
