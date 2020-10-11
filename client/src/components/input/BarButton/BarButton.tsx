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
}

export default function BarButton({
    isActive,
    clickHandler,
    icon,
    titleText,
    size,
    className
}: Props): ReactElement {
    return (
        <div
            className={
                (size === 'large' ? 'w-8 h-8 mt-2' : 'w-6 h-6 mt-3') +
                ' flex cursor-pointer z-50 p-1 mr-2 ' +
                (isActive
                    ? size === 'large'
                        ? 'bg-purple-700'
                        : 'bg-gray-400'
                    : 'bg-gray-800') +
                (className ? ' ' + className : '')
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
                            : 'text-gray-200'
                        : 'text-gray-200')
                }
                opacity={isActive ? 1 : 0.7}
                icon={icon}
                size={size === 'large' ? '1x' : 'xs'}
            ></FontAwesomeIcon>
        </div>
    );
}
