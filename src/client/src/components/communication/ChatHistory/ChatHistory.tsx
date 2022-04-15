import { ReactElement, Ref } from 'react';
import { ClientParty, FormattedChatMessage } from '../../../../../shared/types';

interface Props {
    chatHistoryRef: Ref<HTMLDivElement>;
    chat: {
        [party: string]: FormattedChatMessage[];
    };
    party: ClientParty;
    userId: string;
    isActive: boolean;
    uiVisible: boolean;
    t: (translationKey: string) => React.ReactNode;
}

export default function ChatHistory({
    chatHistoryRef,
    chat,
    party,
    userId,
    isActive,
    uiVisible,
    t
}: Props): ReactElement {
    return (
        <div
            className={
                'mb-2 py-1 px-2 chatContainer z-50 backgroundShade rounded text-base break-words' +
                (!uiVisible || !isActive ? ' chatHistoryHideScrollbar' : '')
            }
            ref={chatHistoryRef}
        >
            {chat[party.id].map((chatMessage, index) => {
                return (
                    <div
                        key={index}
                        className={chat[party.id].length > 1 ? 'mb-2' : ''}
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
                        {chatMessage.message.map(
                            // @ts-ignore FIXME
                            (element: JSX.Element, index: number) => {
                                return <span key={index}>{element}</span>;
                            }
                        )}
                    </div>
                );
            })}
        </div>
    );
}
