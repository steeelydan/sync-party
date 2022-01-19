import { ChangeEventHandler } from 'react';
import { v4 as uuid } from 'uuid';

type Props = {
    value: string;
    id?: string;
    type?: string;
    label?: string;
    labelWidth?: string;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
    autoFocus?: boolean;
    onChange: ChangeEventHandler;
    onFocus?: React.EventHandler<React.SyntheticEvent>;
    onBlur?: React.EventHandler<React.SyntheticEvent>;
    onKeyDown?: React.EventHandler<React.KeyboardEvent>;
};

export default function InputText({
    value,
    id,
    type,
    label,
    labelWidth,
    defaultValue,
    placeholder,
    className,
    containerClassName,
    autoFocus,
    onChange,
    onKeyDown,
    onFocus,
    onBlur
}: Props): JSX.Element {
    const randomId = uuid();

    return (
        <div
            className={
                'md:flex md:items-center my-auto' +
                (containerClassName ? ' ' + containerClassName : '')
            }
        >
            {label && (
                <div className={labelWidth ? labelWidth : 'w-1/6'}>
                    <label
                        className="block text-gray-200 mb-1 md:mb-0 pr-1"
                        htmlFor={randomId}
                    >
                        {label}
                    </label>
                </div>
            )}
            <div className="w-full">
                <input
                    type={type ? type : 'text'}
                    value={value}
                    className={
                        'appearance-none w-full rounded focus:outline-none border' +
                        (className
                            ? ' ' + className
                            : ' bg-gray-200 border-gray-200 py-2 px-2 text-gray-900 leading-tight focus:bg-white focus:border-purple-500')
                    }
                    id={id ? id : randomId}
                    onKeyDown={onKeyDown}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                ></input>
            </div>
        </div>
    );
}
