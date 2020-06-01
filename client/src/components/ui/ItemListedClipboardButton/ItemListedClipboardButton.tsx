import React, { ReactElement } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';

interface Props {
    itemUrl: string;
    hovering: boolean;
}

export default function ItemListedClipboardButton({
    itemUrl,
    hovering
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <CopyToClipboard text={itemUrl}>
            <span
                className={!hovering ? 'hidden' : 'mr-2 my-auto'}
                title={t('mediaMenu.copy')}
                color="text-gray-300 hover:text-gray-200"
            >
                <FontAwesomeIcon icon={faClipboard} size="1x"></FontAwesomeIcon>
            </span>
        </CopyToClipboard>
    );
}
