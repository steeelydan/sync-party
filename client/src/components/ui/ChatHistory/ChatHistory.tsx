import React, { ReactElement, Ref } from 'react';

interface Props {
    chatHistoryRef: Ref<HTMLDivElement>;
    chat: {
        [party: string]: FormattedChatMessage[];
    };
    party: ClientParty;
}

export default function ChatHistory({
    chatHistoryRef,
    chat,
    party
}: Props): ReactElement {
    return (
        <div
            className="mb-2 py-1 px-2 chatContainer z-50 backgroundShade rounded text-sm"
            ref={chatHistoryRef}
        >
            {chat[party.id].map((chatMessage, index) => {
                return (
                    <div
                        key={index}
                        className={chat[party.id].length > 1 ? 'pb-1' : ''}
                    >
                        <span className="text-purple-400">
                            {chatMessage.userName}:{' '}
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
