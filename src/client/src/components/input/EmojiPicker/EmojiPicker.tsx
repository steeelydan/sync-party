import { Picker } from 'emoji-mart';
import { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';

type Props = {
    addEmoji: (emoji: any) => void;
};

export const EmojiPicker = ({ addEmoji }: Props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        new Picker({
            native: true,
            sheetSize: 16,
            showPreview: false,
            useButton: false,
            onEmojiSelect: (emoji: any): void => {
                addEmoji(emoji);
            },
            data: data,
            ref: ref
        });
    }, [addEmoji]);

    return <div ref={ref} />;
};
