import React, { ReactElement, useEffect, useState } from 'react';
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
import ItemListed2 from '../ItemListed2/ItemListed2';

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

    const { t } = useTranslation();
    const [itemsFilter, setItemsFilter] = useState<string | null>(null);
    const [filteredItems, setFilteredItems] = useState<MediaItem[]>(
        userItems && userItems.length ? sortItems(userItems) : []
    );
    const [listCache, setListCache] = useState(
        new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 50
        })
    ); // FIXME

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

    console.log(listCache);

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
                <div className="">
                    <AutoSizer>
                        {({ width, height }): React.ReactElement => {
                            return (
                                <List
                                    width={width}
                                    height={height}
                                    deferredMeasurementCache={listCache}
                                    rowHeight={listCache.rowHeight}
                                    rowRenderer={({
                                        index,
                                        key,
                                        style,
                                        parent
                                    }): JSX.Element => (
                                        <CellMeasurer
                                            key={key}
                                            cache={listCache}
                                            parent={parent}
                                            columnIndex={0}
                                            rowIndex={index}
                                        >
                                            <ItemListed2
                                                style={style}
                                                index={index}
                                                items={filteredItems}
                                                addUserItem={addUserItem}
                                                setPlayerFocused={
                                                    setPlayerFocused
                                                }
                                                handleItemEditSave={
                                                    handleItemEditSave
                                                }
                                            />
                                        </CellMeasurer>
                                    )}
                                    rowCount={filteredItems.length}
                                    overscanRowCount={3}
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
