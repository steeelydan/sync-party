import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement } from 'react';

interface Props {
    isActive: boolean;
    clickHandler: Function;
    icon: IconDefinition;
    titleText: string;
    size: 'large' | 'small';
    className?: string;
    margins?: string;
}

export default function BarButton({
    isActive,
    clickHandler,
    icon,
    titleText,
    size,
    className,
    margins
}: Props): ReactElement {
    return (
        <div
            className={
                (size === 'large' ? 'w-8 h-8' : 'w-6 h-6') +
                ' flex cursor-pointer z-50 p-1 ' +
                (isActive
                    ? size === 'large'
                        ? 'bg-purple-700'
                        : 'bg-gray-400'
                    : 'bg-gray-800') +
                (className ? ' ' + className : '') +
                (margins
                    ? ' ' + margins
                    : size === 'large'
                    ? ' mt-2 mr-2'
                    : ' mt-3 mr-2')
            }
            onClick={(): void => clickHandler()}
            style={{ borderRadius: '100%' }}
            title={titleText}
        >
            <FontAwesomeIcon
                className={
                    'm-auto ' +
                    (isActive
                        ? size === 'small'
                            ? 'text-gray-800'
                            : 'text-gray-100'
                        : 'text-gray-100')
                }
                opacity={isActive ? 1 : 0.7}
                icon={icon}
                size={size === 'large' ? '1x' : 'xs'}
            ></FontAwesomeIcon>
        </div>
    );
}
