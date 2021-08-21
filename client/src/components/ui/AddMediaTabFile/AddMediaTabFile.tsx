import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import InputText from '../../input/InputText/InputText';
import Button from '../../input/Button/Button';
import { audioExtensions, videoExtensions } from '../../../common/helpers';

interface Props {
    file: File | null;
    setFile: (file: File) => void;
    mediaItem: NewMediaItem;
    setMediaItem: (mediaItem: NewMediaItem) => void;
    addFileItem: (event: React.MouseEvent) => Promise<void>;
    resetUploadForm: () => void;
    setPlayerFocused: (focused: boolean) => void;
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
    const dispatch = useDispatch();

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
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ): void => {
                                if (event.target.files) {
                                    const file = event.target.files[0];
                                    if (
                                        audioExtensions.test(file.name) ||
                                        videoExtensions.test(file.name)
                                    ) {
                                        setFile(file);
                                        setMediaItem({
                                            ...mediaItem,
                                            name: file.name,
                                            url: file.name
                                        });
                                    } else {
                                        dispatch(
                                            setGlobalState({
                                                errorMessage: t(
                                                    'mediaMenu.invalidFileType'
                                                )
                                            })
                                        );

                                        event.target.value = '';
                                    }
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
                        containerClassName="mb-3"
                        placeholder={t('mediaMenu.addNameDescription')}
                        onFocus={(): void => setPlayerFocused(false)}
                        onBlur={(): void => setPlayerFocused(true)}
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
