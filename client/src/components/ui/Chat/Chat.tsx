import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faSmile } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from '../ChatHistory/ChatHistory';
import ChatInput from '../ChatInput/ChatInput';
import { setGlobalState } from '../../../actions/globalActions';

interface Props {
    socket: SocketIOClient.Socket | null;
    setPlayerFocused: Function;
    freezeUiVisible: Function;
}

export default function Chat({
    socket,
    setPlayerFocused,
    freezeUiVisible
}: Props): ReactElement {
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const chat = useSelector((state: RootAppState) => state.globalState.chat);
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );
    const uiFocused = useSelector(
        (state: RootAppState) => state.globalState.uiFocused
    );

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [isActive, setIsActive] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [chatHistoryTimeoutDone, setChatHistoryTimeoutDone] = useState(false);

    const chatHistoryRef = useRef<HTMLDivElement | null>(null);
    const textInputRef = useRef<HTMLTextAreaElement | null>(null);

    const scrollHistoryToBottom = (): void => {
        if (chatHistoryRef && chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop =
                chatHistoryRef.current.scrollHeight;
        }
    };

    const toggleChat = (): void => {
        if (!isActive) {
            setTimeout(() => {
                scrollHistoryToBottom();
                focusTextInput();
            }, 50);
        }

        dispatch(
            setGlobalState({
                uiFocused: {
                    ...uiFocused,
                    chat: !isActive
                }
            })
        );

        setIsActive(!isActive);
    };

    const sendMessage = (message: string): void => {
        if (socket && user && party && message !== '') {
            const chatMessage = {
                userId: user.id,
                partyId: party.id,
                userName: user.username,
                message: message
            };
            socket.emit('chatMessage', chatMessage);
            setTextInput('');
        }
    };

    const focusTextInput = (): void => {
        if (textInputRef.current) {
            textInputRef.current.focus();
            freezeUiVisible(true);
        }
    };

    const blurTextInput = (): void => {
        if (textInputRef.current) {
            textInputRef.current.blur();
        }
    };

    const handleInputFieldKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage(textInput);
            setShowEmojiPicker(false);
        } else if (event.key === 'Escape') {
            if (showEmojiPicker) {
                setShowEmojiPicker(false);
                focusTextInput();
            } else {
                setPlayerFocused(true);
                freezeUiVisible(false);
                blurTextInput();
            }
        }
    };

    const handleEmojiPickerKeydown = (
        event: React.KeyboardEvent<HTMLDivElement>
    ): void => {
        if (event.key === 'Escape') {
            setShowEmojiPicker(false);
            focusTextInput();
        }
    };

    const handleEmojiPickerIconClick = (): void => {
        if (!showEmojiPicker) {
            freezeUiVisible(true);
        }
        setShowEmojiPicker(!showEmojiPicker);
        setPlayerFocused(!showEmojiPicker);
        focusTextInput();
    };

    const addEmoji = (emoji: any): void => {
        if (textInputRef.current) {
            textInputRef.current.focus();

            setTimeout(() => {
                if (textInputRef.current) {
                    const newCursorPosition =
                        textInputRef.current.selectionStart +
                        emoji.native.length;

                    const textBeforeCursorPosition = textInputRef.current.value.substring(
                        0,
                        textInputRef.current.selectionStart
                    );
                    const textAfterCursorPosition = textInputRef.current.value.substring(
                        textInputRef.current.selectionEnd,
                        textInputRef.current.value.length
                    );

                    setTextInput(
                        textBeforeCursorPosition +
                            emoji.native +
                            textAfterCursorPosition
                    );

                    textInputRef.current.selectionStart = textInputRef.current.selectionEnd = newCursorPosition;
                }
            }, 10);
        }
    };

    // At mounting
    useEffect(() => {
        scrollHistoryToBottom();
    }, []);

    // If ui visibility or history timeout changes
    useEffect(() => {
        scrollHistoryToBottom();
    }, [uiVisible, chatHistoryTimeoutDone]);

    // If there is a new message
    useEffect(() => {
        scrollHistoryToBottom();
        setChatHistoryTimeoutDone(false);
        const historyTimeoutId = setTimeout(() => {
            setChatHistoryTimeoutDone(true);
        }, 12000);
        const freezeTimeoutId = setTimeout(() => {
            freezeUiVisible(false);
        }, 2000);

        return (): void => {
            clearTimeout(historyTimeoutId);
            clearTimeout(freezeTimeoutId);
        };
    }, [chat, freezeUiVisible]);

    return (
        <div
            className={
                'absolute bottom-0 left-0 ml-3 z-50' +
                (uiVisible ? ' mb-12' : ' mb-3')
            }
        >
            <div className="flex flex-row">
                <div className="flex flex-col mt-auto">
                    {(uiVisible || !chatHistoryTimeoutDone) &&
                        party &&
                        user &&
                        chat[party.id] && (
                            <ChatHistory
                                chatHistoryRef={chatHistoryRef}
                                chat={chat}
                                party={party}
                                userId={user.id}
                                uiVisible={uiVisible}
                                t={t}
                            ></ChatHistory>
                        )}
                    {isActive && uiVisible && (
                        <div className="mt-auto">
                            <ChatInput
                                textInputRef={textInputRef}
                                textInput={textInput}
                                setPlayerFocused={setPlayerFocused}
                                freezeUiVisible={freezeUiVisible}
                                handleInputFieldKeyDown={
                                    handleInputFieldKeyDown
                                }
                                setTextInput={setTextInput}
                                t={t}
                            ></ChatInput>
                        </div>
                    )}
                </div>
                {isActive && (
                    <div className="mt-auto">
                        {showEmojiPicker && uiVisible && (
                            <div
                                className="ml-2 mb-1"
                                onKeyDown={handleEmojiPickerKeydown}
                            >
                                <Picker
                                    native={true}
                                    sheetSize={16}
                                    showPreview={false}
                                    useButton={false}
                                    onSelect={(emoji): void => {
                                        addEmoji(emoji);
                                    }}
                                ></Picker>
                            </div>
                        )}
                        {!showEmojiPicker && uiVisible && (
                            <FontAwesomeIcon
                                icon={faSmile}
                                className="ml-2 cursor-pointer text-2xl mb-1"
                                onClick={handleEmojiPickerIconClick}
                            ></FontAwesomeIcon>
                        )}
                    </div>
                )}
            </div>
            {uiVisible && (
                <FontAwesomeIcon
                    className="cursor-pointer"
                    onClick={toggleChat}
                    opacity={isActive ? 1 : 0.7}
                    icon={faComment}
                    size="lg"
                    title={isActive ? t('chat.close') : t('chat.open')}
                ></FontAwesomeIcon>
            )}
        </div>
    );
}
