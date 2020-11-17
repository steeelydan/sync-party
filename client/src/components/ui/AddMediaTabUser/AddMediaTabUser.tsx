import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadCry } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import {
    List,
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache
} from 'react-virtualized';
import ItemListed from '../ItemListed/ItemListed';

interface Props {
    partyItemsSet: Set<string>;
    addUserItem: Function;
    setPlayerFocused: Function;
    handleItemEditSave: Function;
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

    const sortItems = (items: MediaItem[]): MediaItem[] => {
        return items.sort((a: MediaItem, b: MediaItem) => {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        });
    };

    const refilterItems = () => {
        if (userItems) {
            setFilteredItems(
                sortItems(
                    userItems.filter((userItem) => {
                        return !partyItemsSet.has(userItem.id);
                    })
                )
            );
        }
    };

    const { t } = useTranslation();
    const [itemsFilter, setItemsFilter] = useState<string | null>(null);
    const [filteredItems, setFilteredItems] = useState<MediaItem[]>(
        userItems && userItems.length ? sortItems(userItems) : []
    );
    const listCache = useRef(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 50
        })
    );

    // (Re-)Filter items if items filter term or user items change
    useEffect(() => {
        if (userItems && itemsFilter !== null) {
            const normalizedSearchTerm = itemsFilter.toLowerCase();

            setItemsFilter(normalizedSearchTerm);

            if (normalizedSearchTerm !== '') {
                setFilteredItems(
                    sortItems(
                        userItems.filter((item) =>
                            item.name
                                .toLowerCase()
                                .includes(normalizedSearchTerm)
                        )
                    )
                );
            } else {
                setFilteredItems(sortItems(userItems));
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
                    <AutoSizer>
                        {({ width, height }): React.ReactElement => {
                            return (
                                <List
                                    width={width}
                                    height={height}
                                    deferredMeasurementCache={listCache.current}
                                    rowHeight={listCache.current.rowHeight}
                                    rowCount={filteredItems.length}
                                    rowRenderer={({
                                        key,
                                        index,
                                        style,
                                        parent
                                    }): JSX.Element => (
                                        <CellMeasurer
                                            key={key}
                                            cache={listCache.current}
                                            parent={parent}
                                            columnIndex={0}
                                            rowIndex={index}
                                        >
                                            <div style={style}>
                                                <ItemListed
                                                    key={
                                                        filteredItems[index].id
                                                    }
                                                    item={filteredItems[index]}
                                                    handleItemClick={(): void => {
                                                        addUserItem(
                                                            filteredItems[index]
                                                        );
                                                        listCache.current.clearAll();
                                                        refilterItems();
                                                    }}
                                                    handleItemSave={(
                                                        item: MediaItem
                                                    ): void => {
                                                        setPlayerFocused(true);
                                                        handleItemEditSave(
                                                            item
                                                        );
                                                    }}
                                                    setPlayerFocused={(
                                                        focused: boolean
                                                    ): void =>
                                                        setPlayerFocused(
                                                            focused
                                                        )
                                                    }
                                                    nameEditingAllowed={true}
                                                ></ItemListed>
                                            </div>
                                        </CellMeasurer>
                                    )}
                                />
                            );
                        }}
                    </AutoSizer>
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
