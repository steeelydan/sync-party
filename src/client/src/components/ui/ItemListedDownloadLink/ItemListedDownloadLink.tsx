import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons';

import type { ReactElement } from 'react';

interface Props {
    partyId: string;
    itemId: string;
    hovering: boolean;
}

export const ItemListedDownloadLink = ({
    partyId,
    itemId,
    hovering
}: Props): ReactElement => {
    const { t } = useTranslation();

    return (
        <a
            className={
                'text-gray-300 hover:text-white' +
                (!hovering ? ' hidden' : ' mr-2 my-auto')
            }
            title={t('mediaMenu.download')}
            href={
                '/api/file/' + itemId + '?party=' + partyId + '&download=true'
            }
            target="_blank"
            rel="noopener noreferrer"
        >
            <FontAwesomeIcon
                icon={faCloudDownloadAlt}
                size="sm"
            ></FontAwesomeIcon>
        </a>
    );
};
