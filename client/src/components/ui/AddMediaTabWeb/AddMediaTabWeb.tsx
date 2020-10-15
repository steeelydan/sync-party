import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../display/Spinner/Spinner';
import Button from '../../input/Button/Button';
import InputText from '../../input/InputText/InputText';

interface Props {
    mediaItem: NewMediaItem;
    setMediaItem: Function;
    addWebItem: Function;
    handleLinkInput: Function;
    setPlayerFocused: Function;
    fetchingLinkMetadata: boolean;
}

export default function AddMediaTabWeb({
    mediaItem,
    setMediaItem,
    addWebItem,
    handleLinkInput,
    setPlayerFocused,
    fetchingLinkMetadata
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <form>
            <p className="mb-2">{t('mediaMenu.addWebDescription')}</p>
            <InputText
                labelWidth="w-20"
                value={mediaItem.url}
                onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                    handleLinkInput(event)
                }
                onFocus={(): void => setPlayerFocused(false)}
                onBlur={(): void => setPlayerFocused(true)}
                placeholder={t('mediaMenu.addWebUrl')}
            ></InputText>
            {mediaItem.url !== '' && !fetchingLinkMetadata && (
                <>
                    <div className="mb-3">
                        <InputText
                            labelWidth="w-20"
                            value={mediaItem.name}
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
                    </div>
                    <Button
                        text={t('common.add')}
                        type="submit"
                        onClick={(event: React.MouseEvent): void => {
                            setPlayerFocused(true);
                            addWebItem(event);
                        }}
                    ></Button>
                </>
            )}
            {fetchingLinkMetadata && <Spinner size="1x"></Spinner>}
        </form>
    );
}
