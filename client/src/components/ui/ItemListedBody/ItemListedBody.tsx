import React, { ReactElement } from 'react';

interface Props {
    item: MediaItem;
    probablyEditedItem: MediaItem;
    setProbablyEditedItem: Function;
    editMode: boolean;
    handleItemClick: Function;
    nameEditingAllowed: boolean;
}

export default function ItemListedBody({
    item,
    probablyEditedItem,
    setProbablyEditedItem,
    editMode,
    handleItemClick,
    nameEditingAllowed
}: Props): ReactElement {
    return (
        <div
            className="flex-col w-full"
            onClick={(): void => {
                if (!editMode) {
                    handleItemClick(item);
                }
            }}
        >
            {!editMode || !nameEditingAllowed ? (
                <span>{item.name}</span>
            ) : (
                <input
                    className="bg-gray-200 text-gray-800 w-full"
                    value={probablyEditedItem.name}
                    onChange={(event): void => {
                        setProbablyEditedItem({
                            ...probablyEditedItem,
                            name: event.target.value
                        });
                    }}
                ></input>
            )}
        </div>
    );
}
