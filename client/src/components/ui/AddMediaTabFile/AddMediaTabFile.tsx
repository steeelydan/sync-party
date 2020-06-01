import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { NewMediaItem } from '../../../types';
import InputText from '../../input/InputText/InputText';
import Button from '../../input/Button/Button';

interface Props {
    file: any;
    setFile: Function;
    mediaItem: NewMediaItem;
    setMediaItem: Function;
    addFileItem: Function;
    resetUploadForm: Function;
    setPlayerFocused: Function;
}

export default function AddMediaTabFile({
    file,
    setFile,
    mediaItem,
    setMediaItem,
    addFileItem,
    resetUploadForm,
    setPlayerFocused
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <form>
            {!file && (
                <div className="relative h-32">
                    <>
                        <div className="w-full absolute top-0 left-0 border-dashed border-4 flex dropzone">
                            <div className="p-auto m-auto text-center">
                                <p>{t('mediaMenu.addFileDragDrop')}</p>
                                <p className="mt-6">
                                    {t('mediaMenu.addFileUploadDialog')}
                                </p>
                            </div>
                        </div>
                        <input
                            className="w-56 h-32 fileupload z-10"
                            onFocus={(): void => setPlayerFocused(false)}
                            onBlur={(): void => setPlayerFocused(true)}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ): void => {
                                if (event.target.files) {
                                    setFile(event.target.files[0]);
                                    setMediaItem({
                                        ...mediaItem,
                                        name: event.target.files[0].name,
                                        url: event.target.files[0].name
                                    });
                                }
                            }}
                            type="file"
                        ></input>
                    </>
                </div>
            )}
            {file && (
                <>
                    <InputText
                        value={mediaItem.name}
                        placeholder={t('mediaMenu.addNameDescription')}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ): void => {
                            setMediaItem({
                                ...mediaItem,
                                name: event.target.value
                            });
                        }}
                    ></InputText>
                    <Button
                        onClick={(): void => resetUploadForm()}
                        className="mt-1 mb-2 mr-2"
                        color="text-gray-200 hover:text-gray-400"
                        text={t('mediaMenu.clearLabel')}
                    ></Button>
                    <Button
                        type="submit"
                        onClick={(event: React.MouseEvent): Promise<void> =>
                            addFileItem(event)
                        }
                        className="mt-1"
                        text={t('mediaMenu.uploadLabel')}
                    ></Button>
                </>
            )}
        </form>
    );
}
