import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { ReactElement } from 'react';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

interface Props {
    icon: IconProp;
    text: string;
}

export default function ActionMessageContent({
    icon,
    text
}: Props): ReactElement {
    return (
        <>
            <FontAwesomeIcon icon={icon}></FontAwesomeIcon>
            <span> {text}</span>
        </>
    );
}
