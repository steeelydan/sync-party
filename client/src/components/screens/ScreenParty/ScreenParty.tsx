import React, { useEffect, useState } from 'react';
import { useParams, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateCurrentParty } from '../../../common/helpers';
import { ClientParty, RootAppState } from '../../../types';
import MediaPlayerContainer from '../../player/MediaPlayerContainer/MediaPlayerContainer';

type Props = {
    socket: SocketIOClient.Socket | null;
};

export default function ScreenParty({ socket }: Props): JSX.Element {
    const dispatch = useDispatch();
    const params: { id: string } = useParams();
    const partyId = params.id;
    const [redirect, setRedirect] = useState(false);

    const userParties = useSelector(
        (state: RootAppState) => state.globalState.userParties
    );
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const playingItem = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );

    useEffect(() => {
        if (userParties && user && socket) {
            const currentParty = userParties.find(
                (userParty: ClientParty) => userParty.id === partyId
            );

            if (
                currentParty &&
                (currentParty.status === 'active' || user.role === 'admin')
            ) {
                if (!playingItem) {
                    updateCurrentParty(dispatch, userParties, currentParty);
                }
            } else {
                setRedirect(true);
            }
        }
    }, [userParties, dispatch, partyId, user, playingItem, socket]);

    if (redirect) {
        if (socket && user) {
            socket.emit('disconnect', { userId: user.id });
        }
        return <Redirect to="/"></Redirect>;
    }

    return <MediaPlayerContainer socket={socket}></MediaPlayerContainer>;
}
