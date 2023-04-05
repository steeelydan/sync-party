import { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from './actions/globalActions';
import socketIOClient from 'socket.io-client';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { getUpdatedUserParties, getUpdatedUserItems } from './common/requests';
import { formatChatMessage, updateCurrentParty } from './common/helpers';
import { translations } from './translations';

import { Auth } from './components/wrappers/Auth/Auth';
import { ScreenDashboard } from './components/screens/ScreenDashboard/ScreenDashboard';
import { ScreenParty } from './components/screens/ScreenParty/ScreenParty';
import { ScreenUser } from './components/screens/ScreenUser/ScreenUser';
import { ScreenEditParty } from './components/screens/ScreenEditParty/ScreenEditParty';
import { ScreenMediaItems } from './components/screens/ScreenMediaItems/ScreenMediaItems';

import type { Socket } from 'socket.io-client';
import type { ChatMessage, RootAppState } from '../../shared/types';

i18n.use(initReactI18next).init({
    returnNull: false,
    resources: translations,
    lng: 'en',
    fallbackLng: 'en'
});

export const App = (): JSX.Element => {
    const loggedIn = useSelector(
        (state: RootAppState) => state.globalState.loggedIn
    );

    const { t } = useTranslation();

    const [socket, setSocket] = useState<Socket | null>(null);
    const dispatch = useDispatch();
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const chat = useSelector((state: RootAppState) => state.globalState.chat);

    // Setup websocket logic
    useEffect(() => {
        if (socket && dispatch) {
            socket.off('partyUpdate');
            socket.off('mediaItemUpdate');
            socket.off('serverTimeOffset');
            socket.off('chatMessage');

            socket.on('serverTimeOffset', (serverTimeOffset: number) => {
                dispatch(
                    setGlobalState({
                        initialServerTimeOffset: serverTimeOffset
                    })
                );
            });

            socket.on('partyUpdate', async () => {
                const updatedUserParties = await getUpdatedUserParties(
                    dispatch,
                    t
                );

                if (party) {
                    await updateCurrentParty(
                        dispatch,
                        updatedUserParties,
                        party
                    );
                }
            });

            socket.on('mediaItemUpdate', async () => {
                await getUpdatedUserItems(dispatch, t); // FIXME: In All Items overview: admin might not get other user's items.
            });

            socket.on('chatMessage', async (chatMessage: ChatMessage) => {
                if (party && chat) {
                    const formattedChatMessage = {
                        ...chatMessage,
                        message: formatChatMessage(chatMessage.message)
                    };

                    const newChat = chat[party.id]
                        ? // @ts-ignore FIXME
                          chat[party.id].concat([formattedChatMessage])
                        : [formattedChatMessage];

                    dispatch(
                        setGlobalState({
                            // @ts-ignore FIXME
                            chat: {
                                [party.id]: newChat
                            }
                        })
                    );
                }
            });
        }
    }, [socket, dispatch, party, t, chat]);

    useEffect(() => {
        if (loggedIn && dispatch && WEBSOCKETS_PORT) {
            setSocket(
                socketIOClient(
                    NODE_ENV === 'production'
                        ? '/'
                        : 'https://localhost:' + WEBSOCKETS_PORT,
                    {
                        transports: ['websocket'],
                        secure: true
                    }
                )
            );

            const getUserData = async (): Promise<void> => {
                try {
                    await getUpdatedUserParties(dispatch, t);
                    await getUpdatedUserItems(dispatch, t);
                    return Promise.resolve();
                } catch (error) {
                    return Promise.reject();
                }
            };

            getUserData();
        }
    }, [loggedIn, dispatch, t]);

    return (
        <div className="flex flex-col text-gray-300 bg-black">
            <Auth>
                <Router>
                    <Routes>
                        <Route
                            path="/party/:id"
                            element={<ScreenParty socket={socket} />}
                        />
                        <Route
                            path="/editParty/:id"
                            element={<ScreenEditParty socket={socket} />}
                        />
                        <Route
                            path="/mediaItems"
                            element={<ScreenMediaItems socket={socket} />}
                        />
                        <Route path="/user" element={<ScreenUser />} />
                        <Route
                            path="/"
                            element={<ScreenDashboard socket={socket} />}
                        />
                        <Route path="*" element={<Navigate replace to="/" />} />
                    </Routes>
                </Router>
            </Auth>
        </div>
    );
};
