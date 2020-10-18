import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ItemListed from '../ItemListed/ItemListed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadCry } from '@fortawesome/free-solid-svg-icons';

interface Props {
    userItemsNotInParty: MediaItem[];
    addUserItem: Function;
    setPlayerFocused: Function;
    handleItemEditSave: Function;
}

export default function AddMediaTabUser({
    userItemsNotInParty,
    addUserItem,
    setPlayerFocused,
    handleItemEditSave
}: Props): ReactElement {
    const { t } = useTranslation();
    const [itemsFilter, setItemsFilter] = useState('');
    const [filteredItems, setFilteredItems] = useState<MediaItem[]>(
        userItemsNotInParty
    );

    const filterItems = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const searchTerm = event.target.value.toLowerCase();
        setItemsFilter(searchTerm);

        if (searchTerm !== '') {
            setFilteredItems(
                userItemsNotInParty.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm)
                )
            );
        } else {
            setFilteredItems(userItemsNotInParty);
        }
    };

    return (
        <div>
            <input
                className="text-white bg-white p-1 text-sm w-full rounded mb-2 bg-opacity-25 outline-none"
                value={itemsFilter}
                placeholder={t('mediaMenu.filter')}
                onChange={filterItems}
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
                            return (
                                <ItemListed
                                    key={source.id}
                                    item={source}
                                    handleItemClick={(): Promise<void> =>
                                        addUserItem(source)
                                    }
                                    handleItemSave={(item: MediaItem): void => {
                                        setPlayerFocused(true);
                                        handleItemEditSave(item);
                                    }}
                                    setPlayerFocused={(
                                        focused: boolean
                                    ): void => setPlayerFocused(focused)}
                                    nameEditingAllowed={true}
                                ></ItemListed>
                            );
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
