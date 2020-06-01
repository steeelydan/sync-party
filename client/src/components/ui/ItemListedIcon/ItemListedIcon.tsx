import React, { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIconFromFileType } from '../../../common/helpers';
import { MediaItem } from '../../../types';

type Props = {
    item: MediaItem;
    editMode: boolean;
    handleItemClick: Function;
};

export default function ItemListedIcon({
    item,
    editMode,
    handleItemClick
}: Props): ReactElement {
    const icon = getIconFromFileType(item.url);

    return (
        <div
            className="flex-col p-auto mr-2"
            onClick={(): void => {
                if (!editMode) {
                    handleItemClick(item);
                }
            }}
        >
            <FontAwesomeIcon icon={icon}></FontAwesomeIcon>{' '}
        </div>
    );
}
