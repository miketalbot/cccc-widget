import {
    closestCenter,
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { Box, List } from "@material-ui/core"
import {
    createContext,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState
} from "react"
import { createPortal } from "react-dom"
import { noop } from "./noop"

const DragContext = createContext({})

export function Sortable({ items, id = "id", children, onDragEnd = noop }) {
    const [overlay, setDragOverlay] = useState(null)
    const [context] = useState({})
    context.setDragOverlay = setDragOverlay
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require the mouse to move by 10 pixels before activating
            activationConstraint: {
                distance: 10
            }
        })
    )
    return (
        <DragContext.Provider value={context}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <SortableContext
                    items={items.map((item) => item[id])}
                    strategy={verticalListSortingStrategy}
                >
                    {children}
                </SortableContext>
                {createPortal(
                    <DragOverlay>
                        {overlay && <List>{overlay}</List>}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </DragContext.Provider>
    )
    function handleDragEnd({ active, over }) {
        context.active = null
        setDragOverlay(null)
        if (active.id !== over.id) {
            arrayMoveInPlace(
                items,
                items.findIndex((i) => i[id] === active.id),
                items.findIndex((i) => i[id] === over.id)
            )
            onDragEnd(items)
        }
    }
    function handleDragStart({ active }) {
        context.active = active
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
    const { active, setDragOverlay } = useContext(DragContext)
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id })
    const style = {
        transform: convert(transform),
        transition,
        opacity: id === active?.id ? 0.2 : 1
    }
    useEffect(() => {
        if (active?.id === id) {
            setDragOverlay(<Component {...props}>{children}</Component>)
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active?.id, id, setDragOverlay])
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
            ref={setNodeRef}
            style={style}
        >
            {children}
        </Component>
    )
}
