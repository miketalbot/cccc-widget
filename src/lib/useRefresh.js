import { useEffect, useMemo, useRef, useState } from "react"

export function useRefresh(...functions) {
    const [, refresh] = useState(0)
    const mounted = useRef(true)
    useEffect(() => {
        mounted.current = true
        return () => (mounted.current = false)
    }, [])
    const refreshFunction = useMemo(
        () =>
            (...params) => {
                if (params.length === 1 && typeof params[0] === "function") {
                    return async (...subParams) => {
                        await params[0](...subParams)
                        refreshFunction()
                    }
                }
                for (let fn of functions) {
                    if (fn) {
                        fn(...params)
                    }
                }
                if (mounted.current) {
                    refresh((i) => i + 1)
                }
            },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...functions]
    )
    return refreshFunction
}
