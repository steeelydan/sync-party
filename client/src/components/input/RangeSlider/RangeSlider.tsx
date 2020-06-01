import React, { ChangeEventHandler } from 'react';

type Props = {
    value: number;
    onChange: ChangeEventHandler;
    className: string;
    ariaLabel: string;
    width?: string;
    onMouseDown?: React.MouseEventHandler<HTMLInputElement>;
    onMouseUp?: React.MouseEventHandler<HTMLInputElement>;
};

export default function RangeSlider({
    value,
    onChange,
    className,
    ariaLabel,
    width,
    onMouseDown,
    onMouseUp
}: Props): JSX.Element {
    return (
        <input
            type="range"
            value={value}
            min={0}
            max={1}
            step="any"
            className={
                'appearance-none outline-none bg-gray-400 h-1 my-auto' +
                (className ? ' ' + className : '') +
                (width ? ' ' + width : ' w-full')
            }
            aria-label={ariaLabel}
            onMouseDown={onMouseDown}
            onChange={onChange}
            onMouseUp={onMouseUp}
        />
    );
}
