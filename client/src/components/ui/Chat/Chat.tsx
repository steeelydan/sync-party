import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from '../ChatHistory/ChatHistory';
import ChatInput from '../ChatInput/ChatInput';

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

    const { t } = useTranslation();

    const [textInput, setTextInput] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [chatHistoryTimeoutDone, setChatHistoryTimeoutDone] = useState(false);

    const chatHistoryRef = useRef<HTMLDivElement | null>(null);

    const scrollHistoryToBottom = (): void => {
        if (chatHistoryRef && chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop =
                chatHistoryRef.current.scrollHeight;
        }
    };

    const sendMessage = (message: string): void => {
        if (socket && user && party) {
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

    // At mounting
    useEffect(() => {
        scrollHistoryToBottom();
    }, []);

    // If there is a new message
    useEffect(() => {
        scrollHistoryToBottom();
        setChatHistoryTimeoutDone(false);
        const timeOutId = setTimeout(() => {
            setChatHistoryTimeoutDone(true);
        }, 12000);

        return (): void => {
            clearTimeout(timeOutId);
        };
    }, [chat]);

    return (
        <div
            className={
                'absolute bottom-0 left-0 ml-3 z-50' +
                (uiVisible ? ' mb-12' : ' mb-3')
            }
        >
            {isActive && (
                <>
                    {(uiVisible || !chatHistoryTimeoutDone) &&
                        party &&
                        user &&
                        chat[party.id] && (
                            <ChatHistory
                                chatHistoryRef={chatHistoryRef}
                                chat={chat}
                                party={party}
                                userId={user.id}
                                t={t}
                            ></ChatHistory>
                        )}
                    {uiVisible && (
                        <ChatInput
                            textInput={textInput}
                            setPlayerFocused={setPlayerFocused}
                            freezeUiVisible={freezeUiVisible}
                            sendMessage={sendMessage}
                            setTextInput={setTextInput}
                            t={t}
                        ></ChatInput>
                    )}
                </>
            )}
            {uiVisible && (
                <FontAwesomeIcon
                    className="cursor-pointer"
                    onClick={(): void => setIsActive(!isActive)}
                    opacity={isActive ? 1 : 0.7}
                    icon={faComment}
                    size="lg"
                    title={isActive ? t('chat.close') : t('chat.open')}
                ></FontAwesomeIcon>
            )}
        </div>
    );
}
