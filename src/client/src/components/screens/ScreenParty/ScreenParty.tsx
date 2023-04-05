import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateCurrentParty } from '../../../common/helpers';
import { MediaPlayerContainer } from '../../player/MediaPlayerContainer/MediaPlayerContainer';

import type { Socket } from 'socket.io-client';
import type { ClientParty, RootAppState } from '../../../../../shared/types';

type Props = {
    socket: Socket | null;
};

export const ScreenParty = ({ socket }: Props): JSX.Element => {
    const dispatch = useDispatch();
    const params = useParams();
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
        return <Navigate to="/"></Navigate>;
    }

    return <MediaPlayerContainer socket={socket}></MediaPlayerContainer>;
};
