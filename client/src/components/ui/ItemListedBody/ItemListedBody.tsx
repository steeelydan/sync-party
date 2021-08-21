import React, { ReactElement } from 'react';

interface Props {
    item: MediaItem;
    probablyEditedItem: MediaItem;
    setProbablyEditedItem: (probablyEditedItem: MediaItem) => void;
    editMode: boolean;
    handleItemClick: (mediaItem: MediaItem) => void;
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
                <span className="breakLongWords">{item.name}</span>
            ) : (
                <input
                    autoFocus
                    className="bg-gray-200 text-gray-800 w-full p-1"
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
