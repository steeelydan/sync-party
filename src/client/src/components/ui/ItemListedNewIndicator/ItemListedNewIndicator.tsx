import type { ReactElement } from 'react';

export default function ItemListedNewIndicator(): ReactElement {
    return (
        <div className="my-auto">
            <div
                className={
                    'rounded-full h-2 w-2 border border-green-500 bg-green-500 shrink-0'
                }
            ></div>
        </div>
    );
}
