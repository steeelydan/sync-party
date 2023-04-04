import Heading from '../../display/Heading/Heading';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import type { ReactElement } from 'react';

interface Props {
    children: JSX.Element | JSX.Element[];
    heading: string;
    onClose: () => void;
}

export default function AdminActionOverlay({
    children,
    heading,
    onClose
}: Props): ReactElement {
    return (
        <div className="w-screen h-screen absolute flex p-20">
            <div className="z-50 m-auto max-w-screen-md max-h-screen-md w-full border border-gray-500 rounded shadow-md backgroundShade p-5">
                <div className="flex flex-row justify-between">
                    <Heading className="mb-5" size={2} text={heading}></Heading>
                    <ButtonIcon
                        className="p-1"
                        color="text-gray-200"
                        title="Close"
                        icon={
                            <FontAwesomeIcon
                                icon={faTimes}
                                size="lg"
                            ></FontAwesomeIcon>
                        }
                        onClick={(): void => onClose()}
                    ></ButtonIcon>
                </div>
                {children}
            </div>
        </div>
    );
}
