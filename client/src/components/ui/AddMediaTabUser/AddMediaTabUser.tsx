import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ItemListed from '../ItemListed/ItemListed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadCry } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

interface Props {
    partyItemsSet: Set<string>;
    addUserItem: (mediaItem: MediaItem) => Promise<void>;
    setPlayerFocused: (focused: boolean) => void;
    handleItemEditSave: (mediaItem: MediaItem) => void;
}

export default function AddMediaTabUser({
    partyItemsSet,
    addUserItem,
    setPlayerFocused,
    handleItemEditSave
}: Props): ReactElement {
    const userItems = useSelector(
        (state: RootAppState) => state.globalState.userItems
    );

    const { t } = useTranslation();
    const [itemsFilter, setItemsFilter] = useState<string | null>(null);
    const [filteredItems, setFilteredItems] = useState<MediaItem[]>(
        userItems || []
    );

    // (Re-)Filter items if items filter term or user items change
    useEffect(() => {
        if (userItems && itemsFilter !== null) {
            const normalizedSearchTerm = itemsFilter.toLowerCase();

            setItemsFilter(normalizedSearchTerm);

            if (normalizedSearchTerm !== '') {
                setFilteredItems(
                    userItems.filter((item) =>
                        item.name.toLowerCase().includes(normalizedSearchTerm)
                    )
                );
            } else {
                setFilteredItems(userItems);
            }
        }
    }, [userItems, itemsFilter]);

    return (
        <div>
            <input
                className="text-white p-1 text-sm w-full rounded mb-2 outline-none backgroundOpacityLow"
                value={itemsFilter || ''}
                placeholder={t('mediaMenu.filter')}
                onChange={(event): void => setItemsFilter(event.target.value)}
                onFocus={(): void => setPlayerFocused(false)}
                onBlur={(): void => setPlayerFocused(true)}
            ></input>
            {filteredItems.length ? (
                <div className="userItemList">
                    {filteredItems
                        .sort((a: MediaItem, b: MediaItem) => {
                            return a.name.toLowerCase() < b.name.toLowerCase()
                                ? -1
                                : 1;
                        })
                        .map((source: MediaItem) => {
                            if (!partyItemsSet.has(source.id)) {
                                return (
                                    <ItemListed
                                        key={source.id}
                                        item={source}
                                        handleItemClick={(): Promise<void> =>
                                            addUserItem(source)
                                        }
                                        handleItemSave={(
                                            item: MediaItem
                                        ): void => {
                                            setPlayerFocused(true);
                                            handleItemEditSave(item);
                                        }}
                                        setPlayerFocused={(
                                            focused: boolean
                                        ): void => setPlayerFocused(focused)}
                                        nameEditingAllowed={true}
                                    ></ItemListed>
                                );
                            } else {
                                return null;
                            }
                        })}
                </div>
            ) : itemsFilter === '' ? (
                <div className="flex flex-row">
                    <div className="m-auto mr-2">
                        <FontAwesomeIcon
                            size="2x"
                            icon={faSadCry}
                        ></FontAwesomeIcon>
                    </div>
                    <div>
                        <p>{t('mediaMenu.userItemsEmpty')}</p>
                        <p>{t('mediaMenu.userItemsUpload')}</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row">
                    {t('mediaMenu.noFilterResults')}.
                </div>
            )}
        </div>
    );
}
