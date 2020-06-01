import React, { ChangeEventHandler, EventHandler } from 'react';
import { v4 as uuid } from 'uuid';

type Props = {
    value: string;
    label?: string;
    labelWidth?: string;
    onChange: ChangeEventHandler;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
    onFocus?: React.EventHandler<React.SyntheticEvent>;
    onBlur?: React.EventHandler<React.SyntheticEvent>;
};

export default function InputText({
    value,
    label,
    labelWidth,
    onChange,
    defaultValue,
    placeholder,
    className,
    onFocus,
    onBlur
}: Props): JSX.Element {
    const fieldId = uuid();

    return (
        <div
            className={
                'md:flex md:items-center my-auto mb-3' +
                (className ? ' ' + className : '')
            }
        >
            {label && (
                <div className={labelWidth ? labelWidth : 'w-1/6'}>
                    <label
                        className="block text-gray-200 mb-1 md:mb-0 pr-1"
                        htmlFor={fieldId}
                    >
                        {label}
                    </label>
                </div>
            )}
            <div className="w-full">
                <input
                    value={value}
                    className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-2 text-gray-900 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                    id={fieldId}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                ></input>
            </div>
        </div>
    );
}
