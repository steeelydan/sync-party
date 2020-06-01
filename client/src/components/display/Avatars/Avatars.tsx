import React from 'react';
import { useSelector } from 'react-redux';
import { ClientPartyMember, RootAppState } from '../../../types';
import Avatar from '../Avatar/Avatar';

export default function Avatars(): JSX.Element | null {
    const party = useSelector((state: RootAppState) => state.globalState.party);
    const user = useSelector((state: RootAppState) => state.globalState.user);
    const playingItem = useSelector(
        (state: RootAppState) => state.globalState.playingItem
    );
    const memberStatus = useSelector(
        (state: RootAppState) => state.globalState.memberStatus
    );
    const uiVisible = useSelector(
        (state: RootAppState) => state.globalState.uiVisible
    );

    return party && memberStatus && user && (uiVisible || !playingItem) ? (
        <div className="absolute right-0 top-0 flex flex-row pl-5">
            {party.members &&
                party.members.map((member: ClientPartyMember) => {
                    return (
                        <Avatar
                            showTitle={true}
                            key={member.username}
                            username={member.username}
                            online={
                                memberStatus[member.id]
                                    ? memberStatus[member.id].online
                                    : false
                            }
                            user={user}
                            size={10}
                        ></Avatar>
                    );
                })}
        </div>
    ) : null;
}
