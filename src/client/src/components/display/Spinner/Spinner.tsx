import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import type { ReactElement } from 'react';

interface Props {
    size?:
        | '5x'
        | 'xs'
        | 'lg'
        | 'sm'
        | '1x'
        | '2x'
        | '3x'
        | '4x'
        | '6x'
        | '7x'
        | '8x'
        | '9x'
        | '10x'
        | undefined;
}

export default function Spinner({ size }: Props): ReactElement {
    return (
        <FontAwesomeIcon
            className="m-auto"
            icon={faSpinner}
            spin
            size={size ? size : '5x'}
        ></FontAwesomeIcon>
    );
}
