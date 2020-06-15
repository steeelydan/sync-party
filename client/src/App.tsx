import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setGlobalState } from './actions/globalActions';
import socketIOClient from 'socket.io-client';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { getUpdatedUserParties, getUpdatedUserItems } from './common/requests';
import { updateCurrentParty } from './common/helpers';
import translations from './translations';

import Auth from './components/wrappers/Auth/Auth';
import ScreenDashboard from './components/screens/ScreenDashboard/ScreenDashboard';
import ScreenParty from './components/screens/ScreenParty/ScreenParty';
import ScreenUser from './components/screens/ScreenUser/ScreenUser';
import ScreenEditParty from './components/screens/ScreenEditParty/ScreenEditParty';
import ScreenMediaItems from './components/screens/ScreenMediaItems/ScreenMediaItems';

i18n.use(initReactI18next).init({
    resources: translations,
    lng: 'en',
    fallbackLng: 'en'
});

function App(): JSX.Element {
    const loggedIn = useSelector(
        (state: RootAppState) => state.globalState.loggedIn
    );

    const { t } = useTranslation();

    const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
    const dispatch = useDispatch();
    const party = useSelector((state: RootAppState) => state.globalState.party);

    useEffect(() => {
        if (socket && dispatch) {
            socket.off('partyUpdate');
            socket.off('mediaItemUpdate');
            socket.off('serverTimeOffset');

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
        }
    }, [socket, dispatch, party, t]);

    useEffect(() => {
        if (loggedIn && dispatch && process.env.REACT_APP_SOCKET_ROUTE) {
            setSocket(socketIOClient(process.env.REACT_APP_SOCKET_ROUTE));

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
        <div className="w-screen h-screen flex flex-col text-gray-300 bg-black">
            <Auth>
                <Router>
                    <Switch>
                        <Route path="/" exact>
                            <ScreenDashboard socket={socket}></ScreenDashboard>
                        </Route>
                        <Route path="/party/:id" exact>
                            <ScreenParty socket={socket}></ScreenParty>
                        </Route>
                        <Route path="/editParty/:id" exact>
                            <ScreenEditParty socket={socket}></ScreenEditParty>
                        </Route>
                        <Route path="/mediaItems" exact>
                            <ScreenMediaItems
                                socket={socket}
                            ></ScreenMediaItems>
                        </Route>
                        <Route path="/user" exact>
                            <ScreenUser></ScreenUser>
                        </Route>
                    </Switch>
                </Router>
            </Auth>
        </div>
    );
}

export default App;
