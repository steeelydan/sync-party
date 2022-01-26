import { ReactElement } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';

interface Props {
    children: JSX.Element;
    mediaItemId: string;
    index: number;
}

export default function MediaMenuDraggable({
    children,
    mediaItemId,
    index
}: Props): ReactElement {
    return (
        <Draggable draggableId={mediaItemId} index={index}>
            {(provided: DraggableProvided): JSX.Element => (
                <>
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        {children}
                    </div>
                </>
            )}
        </Draggable>
    );
}
