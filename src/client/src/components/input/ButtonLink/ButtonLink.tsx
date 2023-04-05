import type { MouseEventHandler } from 'react';

type Props = {
    text: string;
    onClick: MouseEventHandler;
    className?: string;
    padding?: string;
};

export const ButtonLink = ({
    text,
    onClick,
    className,
    padding
}: Props): JSX.Element => {
    return (
        <button
            className={
                'bg-transparent border-no hover:border-transparent rounded' +
                (className
                    ? ' ' + className
                    : ' text-purple-400 hover:text-purple-200 border-purple-400') +
                (padding ? ' ' + padding : ' py-2 px-4')
            }
            onClick={onClick}
        >
            {text}
        </button>
    );
};
