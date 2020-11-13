import React, { ReactElement } from 'react';
import ItemListed from '../ItemListed/ItemListed';
import { CellMeasurer } from 'react-virtualized';

interface Props {
    items: MediaItem[];
    index: number;
    style: any;
    addUserItem: Function;
    setPlayerFocused: Function;
    handleItemEditSave: Function;
}

export default function ItemListed2({
    items,
    index,
    style,
    addUserItem,
    setPlayerFocused,
    handleItemEditSave
}: Props): ReactElement {
    const source = items[index];

    return (
        <>
            <div style={style} className="row">
                <div className="image">
                    <img src={source.id} alt="" />
                </div>
                <div className="content">
                    <div>{source.id}</div>
                    <div>{source.name}</div>
                </div>
            </div>
            {/* <ItemListed
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
            ></ItemListed> */}
        </>
    );
}
