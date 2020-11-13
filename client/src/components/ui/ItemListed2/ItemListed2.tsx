import React, { ReactElement } from 'react';
import ItemListed from '../ItemListed/ItemListed';

interface Props {
    items: MediaItem[];
    index: number;
    addUserItem: Function;
    setPlayerFocused: Function;
    handleItemEditSave: Function;
}

export default function ItemListed2({
    items,
    index,
    addUserItem,
    setPlayerFocused,
    handleItemEditSave
}: Props): ReactElement {
    const source = items[index];

    return (
        <ItemListed
            key={source.id}
            item={source}
            handleItemClick={(): Promise<void> => addUserItem(source)}
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
}
