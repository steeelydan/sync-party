import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { ButtonIcon } from '../../input/ButtonIcon/ButtonIcon';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ItemListedBody } from '../ItemListedBody/ItemListedBody';
import { ItemListedIcon } from '../ItemListedIcon/ItemListedIcon';
import { ItemListedPlayStatus } from '../ItemListedPlayStatus/ItemListedPlayStatus';
import { ItemListedNewIndicator } from '../ItemListedNewIndicator/ItemListedNewIndicator';
import { ItemListedDownloadLink } from '../ItemListedDownloadLink/ItemListedDownloadLink';
import { ItemListedClipboardButton } from '../ItemListedClipboardButton/ItemListedClipboardButton';

import type { IMediaItem, RootAppState } from '../../../../../shared/types';

type Props = {
    item: IMediaItem;
    handleItemSave: (probablyEditedItem: IMediaItem) => void;
    setPlayerFocused: (focused: boolean) => void;
    isCurrentlyPlayingItem?: boolean;
    alreadyPlayed?: boolean;
    isPlaying?: boolean;
    nameEditingAllowed: boolean;
    handleItemClick: () => void;
    onRemoveButtonClick?: (mediaItem: IMediaItem) => void;
    partyItemListRef?: React.RefObject<HTMLDivElement>;
};

export const ItemListed = ({
    item,
    handleItemSave,
    setPlayerFocused,
    isCurrentlyPlayingItem,
    alreadyPlayed,
    isPlaying,
    nameEditingAllowed,
    handleItemClick,
    onRemoveButtonClick,
    partyItemListRef
}: Props): JSX.Element => {
    const [editMode, setEditMode] = useState(false);
    const [probablyEditedItem, setProbablyEditedItem] = useState(item);
    const [hovering, setHovering] = useState(false);

    const itemListedRef = useRef<HTMLDivElement | null>(null);

    const party = useSelector((state: RootAppState) => state.globalState.party);
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    const { t } = useTranslation();

    // Scroll item into view if it gets activated
    useEffect(() => {
        if (
            partyItemListRef &&
            partyItemListRef.current &&
            itemListedRef.current &&
            isCurrentlyPlayingItem
        ) {
            const list = partyItemListRef.current;
            const item = itemListedRef.current;

            if (
                item.offsetTop < list.scrollTop ||
                item.offsetTop > list.scrollTop + list.offsetHeight
            ) {
                list.scrollTop = item.offsetTop - list.offsetHeight / 2;
            }
        }
    }, [isCurrentlyPlayingItem, partyItemListRef, uiVisible]);

    const activateEditMode = useCallback(
        (activate: boolean): void => {
            if (activate) {
                setEditMode(true);
                setPlayerFocused(false);
            } else {
                setEditMode(false);
                setPlayerFocused(true);
            }
        },
        [setPlayerFocused]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent): void => {
            if (editMode) {
                if (event.code === 'Escape') {
                    event.preventDefault();
                    activateEditMode(false);
                    setProbablyEditedItem(item);
                }
                if (event.code === 'Enter') {
                    event.preventDefault();
                    handleItemSave(probablyEditedItem);
                    activateEditMode(false);
                }
            }
        },
        [activateEditMode, editMode, handleItemSave, item, probablyEditedItem]
    );

    // Add key listeners if editMode is active
    useEffect(() => {
        if (itemListedRef.current) {
            const itemRef = itemListedRef.current;

            if (editMode) {
                itemRef.addEventListener('keydown', handleKeyDown);
            } else {
                itemRef.removeEventListener('keydown', handleKeyDown);
            }

            return (): void => {
                itemRef.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            return;
        }
    }, [editMode, handleKeyDown]);

    return (
        <div
            className="p-1 hover:bg-purple-900 cursor-pointer"
            key={item.id}
            ref={itemListedRef}
            title={
                nameEditingAllowed
                    ? t('mediaMenu.mediaItemClickAddTitle')
                    : t('mediaMenu.mediaItemClickPlayTitle')
            }
            onMouseOver={(): void => {
                setHovering(true);
            }}
            onMouseLeave={(): void => {
                setHovering(false);
            }}
        >
            <div className="flex flex-row justify-between">
                <div className="flex flex-grow">
                    <ItemListedIcon
                        item={item}
                        editMode={editMode}
                        handleItemClick={handleItemClick}
                    ></ItemListedIcon>
                    <ItemListedBody
                        item={item}
                        probablyEditedItem={probablyEditedItem}
                        setProbablyEditedItem={(item: IMediaItem): void =>
                            setProbablyEditedItem(item)
                        }
                        editMode={editMode}
                        handleItemClick={handleItemClick}
                        nameEditingAllowed={nameEditingAllowed}
                    ></ItemListedBody>
                </div>
                <div className="ml-2 mr-1 flex">
                    <ItemListedPlayStatus
                        isCurrentlyPlayingItem={isCurrentlyPlayingItem}
                        hovering={hovering}
                        isPlaying={isPlaying}
                    ></ItemListedPlayStatus>
                    {!isCurrentlyPlayingItem &&
                        alreadyPlayed === false &&
                        !hovering && (
                            <ItemListedNewIndicator></ItemListedNewIndicator>
                        )}
                    {!editMode && nameEditingAllowed ? (
                        <ButtonIcon
                            className={!hovering ? 'hidden' : ''}
                            color="text-gray-300 hover:text-white"
                            onClick={(): void => activateEditMode(!editMode)}
                            title={t('mediaMenu.editButtonTitle')}
                            icon={
                                <FontAwesomeIcon
                                    icon={faPen}
                                    size="sm"
                                ></FontAwesomeIcon>
                            }
                        ></ButtonIcon>
                    ) : (
                        (editMode || !nameEditingAllowed) &&
                        hovering && (
                            <>
                                {probablyEditedItem.type === 'file' &&
                                    party && (
                                        <ItemListedDownloadLink
                                            hovering={hovering}
                                            partyId={party.id}
                                            itemId={probablyEditedItem.id}
                                        ></ItemListedDownloadLink>
                                    )}
                                {!editMode &&
                                    probablyEditedItem.type !== 'file' &&
                                    party && (
                                        <ItemListedClipboardButton
                                            itemUrl={probablyEditedItem.url}
                                            hovering={hovering}
                                        ></ItemListedClipboardButton>
                                    )}
                                {onRemoveButtonClick && (
                                    <ButtonIcon
                                        title={t(
                                            'mediaMenu.mediaItemRemoveTitle'
                                        )}
                                        onClick={(): void => {
                                            onRemoveButtonClick(item);
                                            setEditMode(false);
                                        }}
                                        color="text-gray-300 hover:text-white"
                                        icon={
                                            <FontAwesomeIcon
                                                icon={faTimes}
                                                size="sm"
                                            ></FontAwesomeIcon>
                                        }
                                    ></ButtonIcon>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
