import React from 'react';
import { User } from '../../../types';
import { useTranslation } from 'react-i18next';

type Props = {
    username: string;
    size: number;
    user: User;
    showTitle?: boolean;
    online?: boolean;
    fontSize?: string;
};

export default function Avatar({
    username,
    size,
    user,
    showTitle,
    online,
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
                'rounded-full h-' +
                size +
                ' w-' +
                size +
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
                </div>
            )}
            <span className="z-50">
                {username.toLowerCase().substring(0, 3)}
            </span>
        </div>
    );
}
