import { useCallback, useLayoutEffect, useMemo } from "react"
import { debounce } from "./debounce"

export function useEvent(eventName, handler) {
    const innerHandler = useCallback(
        (e) => handler(e, ...(e._parameters || [])),
        [handler]
    )
    useLayoutEffect(() => {
        window.addEventListener(eventName, innerHandler)
        return () => window.removeEventListener(eventName, innerHandler)
    }, [eventName, innerHandler])
}

export function useDebouncedEvent(eventName, handler, wait = 1, options) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const innerHandler = useMemo(
        () =>
            debounce(
                (e) => handler(e, ...(e._parameters || [])),
                wait,
                options
            ),
        [handler, wait, options]
    )
    useLayoutEffect(() => {
        window.addEventListener(eventName, innerHandler)
        return () => {
            window.removeEventListener(eventName, innerHandler)
        }
    }, [eventName, innerHandler])
}
