import React, { MouseEventHandler } from 'react';

type Props = {
    text: string | JSX.Element;
    type?: 'button' | 'submit' | 'reset' | undefined;
    onClick: MouseEventHandler;
    title?: string;
    className?: string;
    disabled?: boolean;
    color?: string;
    padding?: string;
};

export default function Button({
    text,
    type,
    onClick,
    title,
    className,
    disabled,
    color,
    padding
}: Props): JSX.Element {
    return (
        <button
            title={title}
            className={
                'bg-transparent font-semibold border rounded noOutline' +
                (disabled
                    ? ' text-gray-500'
                    : color
                    ? ' ' + color
                    : ' text-purple-400 hover:text-purple-300 hover:border-purple-300 border-purple-400') +
                (className ? ' ' + className : '') +
                (padding ? ' ' + padding : ' py-1 px-2')
            }
            onClick={onClick}
            disabled={disabled ? true : false}
            type={type ? type : 'button'}
        >
            {text}
        </button>
    );
}
