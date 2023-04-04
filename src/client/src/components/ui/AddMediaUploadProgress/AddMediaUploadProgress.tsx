import { useTranslation } from 'react-i18next';

import type { ReactElement } from 'react';

interface Props {
    progress: number;
    uploadStartTime: number;
}

export default function AddMediaUploadProgress({
    progress,
    uploadStartTime
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <div className="mb-3">
            <progress
                className="w-full appearance-none uploadProgress"
                value={progress}
                max="100"
            ></progress>{' '}
            {progress} % ({t('common.approx')}{' '}
            {Math.round(
                (uploadStartTime +
                    (Date.now() - uploadStartTime) * (100 / progress) -
                    Date.now()) /
                    60000
            )}{' '}
            {t('common.minLeft')})
        </div>
    );
}
