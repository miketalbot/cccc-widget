import { useEffect, useMemo, useRef, useState } from "react"

export function useRefresh(...functions) {
    const [, refresh] = useState(0)
    const mounted = useRef(true)
    useEffect(() => {
        mounted.current = true
        return () => (mounted.current = false)
    }, [])
    return useMemo(
        () => (...params) => {
            for (let fn of functions) {
                fn(...params)
            }
            if (mounted.current) {
                refresh((i) => i + 1)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...functions]
    )
}
