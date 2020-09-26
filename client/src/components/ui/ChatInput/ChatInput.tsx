import React, { ReactElement } from 'react';

interface Props {
    textInput: string;
    setPlayerFocused: Function;
    freezeUiVisible: Function;
    sendMessage: Function;
    setTextInput: Function;
    t: Function;
}

export default function ChatInput({
    textInput,
    setPlayerFocused,
    freezeUiVisible,
    sendMessage,
    setTextInput,
    t
}: Props): ReactElement {
    return (
        <div className="h-auto mb-2 py-1 px-2 chatContainer backgroundShade text-sm rounded border border-purple-400">
            <textarea
                className="appearance-none text-white bg-transparent focus:outline-none placeholder-gray-600 resize-none w-full"
                value={textInput}
                onFocus={(): void => {
                    setPlayerFocused(false);
                    freezeUiVisible(true);
                }}
                onBlur={(): void => {
                    setPlayerFocused(true);
                    freezeUiVisible(false);
                }}
                onKeyDown={(event): boolean => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        sendMessage(textInput);
                        freezeUiVisible(false);

                        return false;
                    } else {
                        return true;
                    }
                }}
                placeholder={t('chat.writeSomething')}
                onChange={(event): void => {
                    freezeUiVisible(true);
                    setTextInput(event.target.value);
                }}
            ></textarea>
        </div>
    );
}
