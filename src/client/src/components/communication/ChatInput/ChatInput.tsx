import { useState } from 'react';

import type { ReactElement, Ref } from 'react';

interface Props {
    textInput: string;
    setPlayerFocused: (focused: boolean) => void;
    freezeUiVisible: (visible: boolean) => void;
    handleInputFieldKeyDown: (event: React.KeyboardEvent) => void;
    setTextInput: (value: string) => void;
    textInputRef: Ref<HTMLTextAreaElement>;
    t: (translationKey: string) => string;
}

export default function ChatInput({
    textInput,
    setPlayerFocused,
    freezeUiVisible,
    handleInputFieldKeyDown,
    setTextInput,
    textInputRef,
    t
}: Props): ReactElement {
    const [freezeUiTimestamp, setFreezeUiTimestamp] = useState(0);

    const intervallicFreezeUiVisible = (freeze: boolean): void => {
        if (freeze) {
            const now = Date.now();

            if (freezeUiTimestamp + 2000 < now) {
                freezeUiVisible(true);
                setFreezeUiTimestamp(now);
            }
        } else {
            freezeUiVisible(false);
        }
    };

    return (
        <div className="h-auto mb-2 py-1 px-2 chatContainer backgroundShade text-sm rounded border border-purple-400">
            <textarea
                ref={textInputRef}
                className="appearance-none text-white bg-transparent focus:outline-none placeholder-gray-600 resize-none w-full text-base"
                value={textInput}
                onFocus={(): void => {
                    setPlayerFocused(false);
                    intervallicFreezeUiVisible(true);
                }}
                onBlur={(): void => {
                    setPlayerFocused(true);
                }}
                onKeyDown={(event): boolean => {
                    handleInputFieldKeyDown(event);
                    if (event.key === 'ENTER') {
                        setFreezeUiTimestamp(0);
                    }
                    return false;
                }}
                placeholder={t('chat.writeSomething')}
                onChange={(event): void => {
                    intervallicFreezeUiVisible(true);
                    setTextInput(event.target.value);
                }}
                onSelect={(): void => {
                    intervallicFreezeUiVisible(true);
                }}
            ></textarea>
        </div>
    );
}
