import React, { MouseEventHandler } from 'react';

type Props = {
    onClick: MouseEventHandler;
    icon: JSX.Element;
    title: string;
    className?: string;
    color?: string;
    padding?: string;
};

export default function ButtonIcon({
    onClick,
    icon,
    title,
    className,
    color,
    padding
}: Props): JSX.Element {
    return (
        <button
            title={title}
            aria-label={title}
            onFocus={(event: React.FocusEvent<HTMLButtonElement>): void => {
                event.target.blur();
            }}
            className={
                'bg-transparent border-no hover:border-transparent rounded' +
                (color
                    ? ' ' + color
                    : ' text-purple-400 hover:text-purple-300') +
                (className ? ' ' + className : '') +
                (padding ? ' ' + padding : '')
            }
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
