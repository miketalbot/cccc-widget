import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { Box } from "@material-ui/core"
import { useLayoutEffect, useMemo } from "react"
import { noop } from "./noop"

export function Sortable({ items, id = "id", children, onDragEnd = noop }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
                distance: 10
            }
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

export function SortableItem({
    Component = Box,
    setDragProps,
    id,
    children,
    ...props
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id })
    const style = {
        transform: convert(transform),
        transition
    }
    const dragProps = useMemo(
        () => ({ ...attributes, ...listeners }),
        [attributes, listeners]
    )
    useLayoutEffect(() => {
        setDragProps(dragProps)
    }, [dragProps, setDragProps])
    return (
        <Component
            {...props}
            {...(setDragProps ? {} : dragProps)}
            onKeyDown={(e) => {
                if (e.target.nodeName !== "input") {
                    listeners.onKeyDown && listeners.onKeyDown(e)
                }
            }}
            ref={setNodeRef}
            style={style}
        >
            {children}
        </Component>
    )
}
