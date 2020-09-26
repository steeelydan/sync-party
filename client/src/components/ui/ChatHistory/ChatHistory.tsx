import React, { ReactElement, Ref } from 'react';

interface Props {
    chatHistoryRef: Ref<HTMLDivElement>;
    chat: {
        [party: string]: FormattedChatMessage[];
    };
    party: ClientParty;
    userId: string;
    t: Function;
}

export default function ChatHistory({
    chatHistoryRef,
    chat,
    party,
    userId,
    t
}: Props): ReactElement {
    return (
        <div
            className="mb-2 py-1 px-2 chatContainer z-50 backgroundShade rounded text-base"
            ref={chatHistoryRef}
        >
            {chat[party.id].map((chatMessage, index) => {
                return (
                    <div
                        key={index}
                        className={chat[party.id].length > 1 ? 'pb-1' : ''}
                    >
                        <span
                            className={
                                userId !== chatMessage.userId
                                    ? 'text-purple-400'
                                    : ''
                            }
                        >
                            {userId !== chatMessage.userId ? (
                                chatMessage.userName
                            ) : (
                                <strong>{t('chat.me')}</strong>
                            )}
                            :{' '}
                        </span>
                        {chatMessage.message.map((element, index) => {
                            return <span key={index}>{element}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
}