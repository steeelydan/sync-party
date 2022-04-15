import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUnlink } from '@fortawesome/free-solid-svg-icons';
import {
    ClientParty,
    MemberStatus,
    PlayerState,
    SyncStatusReceiveMember
} from '../../../../../shared/types';

interface Props {
    party: ClientParty | null;
    playerState: PlayerState;
    syncStatus: SyncStatusReceiveMember[] | null;
    memberStatus: MemberStatus | null;
    uiVisible: boolean;
}

export default function SyncStatus({
    party,
    playerState,
    syncStatus,
    memberStatus,
    uiVisible
}: Props): ReactElement {
    const syncStatusTolerance = 400;

    let lostSync = false;

    if (syncStatus && memberStatus) {
        syncStatus.forEach((member: SyncStatusReceiveMember) => {
            let memberLostSync = false;

            if (
                Math.abs(member.delta) > syncStatusTolerance &&
                memberStatus[member.id] &&
                memberStatus[member.id].online
            ) {
                memberLostSync = true;
            }

            lostSync = memberLostSync;
        });
    }

    return (
        <div className="flex-col mr-2">
            <div className="flex">
                {lostSync && playerState.isPlaying && (
                    <FontAwesomeIcon
                        className="ml-auto mb-2 text-red-600"
                        icon={faUnlink}
                        size="lg"
                    ></FontAwesomeIcon>
                )}
            </div>
            <div className="flex flex-col">
                {party &&
                    syncStatus &&
                    party.members &&
                    uiVisible &&
                    memberStatus &&
                    syncStatus.map((member: SyncStatusReceiveMember) => {
                        return (
                            memberStatus[member.id] &&
                            memberStatus[member.id].online && (
                                <div
                                    key={member.id}
                                    className={
                                        'text-sm' +
                                        (Math.abs(member.delta) <
                                        syncStatusTolerance
                                            ? ' text-green-500'
                                            : ' text-red-600')
                                    }
                                >
                                    {' '}
                                    {playerState.isPlaying &&
                                        member.username +
                                            ': ' +
                                            (Math.round(member.delta) + ' ms')}
                                </div>
                            )
                        );
                    })}
            </div>
        </div>
    );
}
