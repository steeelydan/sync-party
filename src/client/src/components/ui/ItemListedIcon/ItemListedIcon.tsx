import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIconFromFileType } from '../../../common/helpers';
import { IMediaItem } from '../../../../../shared/types';

type Props = {
    item: IMediaItem;
    editMode: boolean;
    handleItemClick: (mediaItem: IMediaItem) => void;
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
