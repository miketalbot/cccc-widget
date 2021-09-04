import { useEffect, useRef, useState } from "react"

export function useMeasurement(ref, shouldRedraw = () => true) {
    const element = useRef()
    const [size, setSize] = useState({
        width: 0,
        height: 0.0000001
    })
    const sizeFn = useRef(setSize)
    sizeFn.current = setSize

    const [observer] = useState(() => new ResizeObserver(measure))
    useEffect(() => {
        return () => {
            sizeFn.current = null
            observer.disconnect()
        }
    }, [observer])
    return [size, attach]

    function sized(...params) {
        if (shouldRedraw(...params)) {
            sizeFn.current && sizeFn.current(...params)
        }
    }

    function attach(target) {
        element.current = target
        ref && ref(target)
        if (target) {
            observer.observe(target)
        }
    }

    function measure(entries) {
        let contentRect = entries[0].contentRect
        if (contentRect.height > 0) {
            sized({
                height: contentRect.height | 0,
                width: contentRect.width | 0,
                left: contentRect.left | 0,
                top: contentRect.top | 0,
                element: element.current
            })
        }
    }
}
