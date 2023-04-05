import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

import type { ReactElement } from 'react';

interface Props {
    isCurrentlyPlayingItem?: boolean;
    hovering: boolean;
    isPlaying?: boolean;
}

export const ItemListedPlayStatus = ({
    isCurrentlyPlayingItem,
    hovering,
    isPlaying
}: Props): ReactElement | null => {
    return isCurrentlyPlayingItem && !hovering ? (
        isPlaying ? (
            <div className="my-auto ml-2">
                <FontAwesomeIcon icon={faPlay} size="xs"></FontAwesomeIcon>
            </div>
        ) : (
            <div className="my-auto ml-2">
                <FontAwesomeIcon icon={faPause} size="xs"></FontAwesomeIcon>
            </div>
        )
    ) : null;
};
