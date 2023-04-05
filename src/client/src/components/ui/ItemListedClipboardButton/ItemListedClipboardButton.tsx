import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';

import type { ReactElement } from 'react';

interface Props {
    itemUrl: string;
    hovering: boolean;
}

export const ItemListedClipboardButton = ({
    itemUrl,
    hovering
}: Props): ReactElement => {
    const { t } = useTranslation();
    const [isClicked, setIsClicked] = useState(false);

    return (
        <CopyToClipboard text={itemUrl}>
            <div
                onClick={(): void => setIsClicked(true)}
                onAnimationIteration={(): void => {
                    setIsClicked(false);
                }}
                className={
                    'text-gray-300 hover:text-white' +
                    (!hovering ? ' hidden' : ' mr-2 my-auto') +
                    (isClicked ? ' animate-ping' : '')
                }
                title={t('mediaMenu.copy')}
            >
                <FontAwesomeIcon icon={faClipboard} size="1x"></FontAwesomeIcon>
            </div>
        </CopyToClipboard>
    );
};
