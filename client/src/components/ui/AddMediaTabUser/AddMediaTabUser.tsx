import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ItemListed from '../ItemListed/ItemListed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSadCry } from '@fortawesome/free-solid-svg-icons';

interface Props {
    party: ClientParty;
    userItems: MediaItem[];
    addUserItem: Function;
    setPlayerFocused: Function;
    handleItemEditSave: Function;
}

export default function AddMediaTabUser({
    party,
    userItems,
    addUserItem,
    setPlayerFocused,
    handleItemEditSave
}: Props): ReactElement {
    const { t } = useTranslation();

    return userItems.filter(
        (userItem: MediaItem) =>
            !party.items.find(
                (partyItem: MediaItem) => partyItem.id === userItem.id
            )
    ).length ? (
        <div className="userItemList">
            {userItems
                .filter(
                    (userItem: MediaItem) =>
                        !party.items.find(
                            (item: MediaItem) => item.id === userItem.id
                        )
                )
                .sort((a: MediaItem, b: MediaItem) => {
                    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
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
                            setPlayerFocused={(focused: boolean): void =>
                                setPlayerFocused(focused)
                            }
                            nameEditingAllowed={true}
                        ></ItemListed>
                    );
                })}
        </div>
    ) : (
        <div className="flex flex-row">
            <div className="m-auto mr-2">
                <FontAwesomeIcon size="2x" icon={faSadCry}></FontAwesomeIcon>
            </div>
            <div>
                <p>{t('mediaMenu.userItemsEmpty')}</p>
                <p>{t('mediaMenu.userItemsUpload')}</p>
            </div>
        </div>
    );
}
