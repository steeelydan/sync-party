import { faPhoneAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import { ClientUser, WebRtcState } from '../../../../../shared/types';

type Props = {
    username: string;
    size: 10 | 8;
    user: ClientUser;
    showTitle?: boolean;
    online?: boolean;
    webRtc?: WebRtcState | null;
    fontSize?: string;
};

export default function Avatar({
    username,
    size,
    user,
    showTitle,
    online,
    webRtc,
    fontSize
}: Props): JSX.Element {
    const { t } = useTranslation();

    return (
        <div
            title={
                showTitle
                    ? username +
                      ': ' +
                      (online ? t('common.online') : t('common.offline'))
                    : ''
            }
            key={username}
            className={
                'rounded-full ' +
                (size === 10 ? 'h-10 w-10' : 'h-8 w-8') +
                ' mr-2 mt-2 backgroundShade flex items-center justify-center' +
                (username === user.username
                    ? ' border border-purple-400 text-purple-400'
                    : ' border border-gray-500 text-gray-200') +
                (fontSize ? ' ' + fontSize : '')
            }
        >
            {(online === true || online === false) && (
                <div className="relative z-40">
                    <div
                        className={
                            'absolute rounded-full h-3 w-3 mb-2 ml-5 bottom-0 border' +
                            (online
                                ? 'border-green-500 bg-green-500'
                                : 'border-red-600 bg-red-600')
                        }
                    ></div>
                    {online && webRtc && webRtc.mode !== 'none' && (
                        <div className="absolute text-xs h-2 w-2 mt-2 ml-5 top-0">
                            <FontAwesomeIcon
                                icon={
                                    webRtc.mode === 'audio'
                                        ? faPhoneAlt
                                        : faVideo
                                }
                            />
                        </div>
                    )}
                </div>
            )}
            <span className="z-50">
                {username.toLowerCase().substring(0, 3)}
            </span>
        </div>
    );
}
