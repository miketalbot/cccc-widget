import { useLayoutEffect, useRef, useState } from "react"

export function useCurrentState(initial) {
    const [value, setValue] = useState(initial)
    const mounted = useRef(true)
    useLayoutEffect(() => {
        mounted.current = true
        return () => (mounted.current = false)
    }, [])
    return [
        value,
        (v) => {
            if (!mounted.current) return
            return setValue(v)
        }
    ]
}
