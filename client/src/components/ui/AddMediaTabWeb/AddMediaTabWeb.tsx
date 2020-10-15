import React, { ReactElement, useState } from 'react';
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
    linkMetadata: {
        videoTitle: string;
        channelTitle: string;
    } | null;
    fetchingLinkMetadata: boolean;
}

export default function AddMediaTabWeb({
    mediaItem,
    setMediaItem,
    addWebItem,
    handleLinkInput,
    setPlayerFocused,
    linkMetadata,
    fetchingLinkMetadata
}: Props): ReactElement {
    const { t } = useTranslation();

    const [nameWithChannelTitle, setNameWithChannelTitle] = useState(false);

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
                        {linkMetadata && linkMetadata.channelTitle && (
                            <div
                                className="cursor-pointer underline text-sm mb-1 text-purple-400"
                                onClick={(): void => {
                                    if (!nameWithChannelTitle) {
                                        setNameWithChannelTitle(true);
                                        setMediaItem({
                                            ...mediaItem,
                                            name:
                                                linkMetadata.channelTitle +
                                                ' - ' +
                                                mediaItem.name
                                        });
                                    } else {
                                        setNameWithChannelTitle(false);
                                        setMediaItem({
                                            ...mediaItem,
                                            name: mediaItem.name.replace(
                                                linkMetadata.channelTitle +
                                                    ' - ',
                                                ''
                                            )
                                        });
                                    }
                                }}
                            >
                                {nameWithChannelTitle
                                    ? 'Remove channel title'
                                    : 'Add channel title'}
                            </div>
                        )}
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
