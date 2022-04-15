import { useSelector } from 'react-redux';
import { getIconFromFileType } from '../../../common/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RootAppState } from '../../../../../shared/types';

export default function TitleDisplay(): JSX.Element | null {
    const playingItem = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    return uiVisible ? (
        <div className="absolute top-0 left-0 ml-2 mt-1">
            {playingItem ? (
                <>
                    <FontAwesomeIcon
                        className="iconShadow"
                        icon={getIconFromFileType(playingItem.url)}
                    ></FontAwesomeIcon>{' '}
                    <span>
                        {playingItem.name.substr(0, 44) +
                            (playingItem.name.length > 44 ? '...' : '')}
                    </span>
                </>
            ) : (
                ''
            )}
        </div>
    ) : null;
}
