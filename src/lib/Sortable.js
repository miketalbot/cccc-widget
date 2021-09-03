import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { Box } from "@material-ui/core"
import { noop } from "./noop"

export function Sortable({ items, id = "id", children, onDragEnd = noop }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((item) => item[id])}
                strategy={verticalListSortingStrategy}
            >
                {children}
            </SortableContext>
        </DndContext>
    )
    function handleDragEnd({ active, over }) {
        if (active.id !== over.id) {
            arrayMoveInPlace(
                items,
                items.findIndex((i) => i[id] === active.id),
                items.findIndex((i) => i[id] === over.id)
            )
            onDragEnd(items)
        }
    }
}
export function arrayMoveInPlace(array, previousIndex, newIndex) {
    if (newIndex >= array.length) {
        let k = newIndex - array.length

        while (k-- + 1) {
            array.push(undefined)
        }
    }
    array.splice(newIndex, 0, array.splice(previousIndex, 1)[0])
    return array
}

function convert(transform) {
    if (!transform) return "translate3d(0px, 0px, 0px)"
    return `translate3d(${transform.x}px, ${transform.y}px, -100px)`
}

export function SortableItem({ Component = Box, id, children, ...props }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id })
    const style = {
        position: "relative",
        zIndex: transform ? 1000 : 0,
        transform: convert(transform),
        transition
    }
    return (
        <Component
            {...props}
            {...attributes}
            {...listeners}
            ref={setNodeRef}
            style={style}
        >
            {children}
        </Component>
    )
}
