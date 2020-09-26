import React, { ReactElement, Ref } from 'react';

interface Props {
    textInput: string;
    setPlayerFocused: Function;
    freezeUiVisible: Function;
    handleInputFieldKeyDown: Function;
    handleInputFieldClick: Function;
    setTextInput: Function;
    textInputRef: Ref<HTMLTextAreaElement>;
    t: Function;
}

export default function ChatInput({
    textInput,
    setPlayerFocused,
    freezeUiVisible,
    handleInputFieldKeyDown,
    handleInputFieldClick,
    setTextInput,
    textInputRef,
    t
}: Props): ReactElement {
    return (
        <div className="h-auto mb-2 py-1 px-2 chatContainer backgroundShade text-sm rounded border border-purple-400">
            <textarea
                autoFocus={true}
                ref={textInputRef}
                className="appearance-none text-white bg-transparent focus:outline-none placeholder-gray-600 resize-none w-full text-base"
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
                    handleInputFieldKeyDown(event);
                    return false;
                }}
                onClick={(): void => {
                    handleInputFieldClick();
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
