import { useEffect, useRef, useState } from "react"

export function useThrottledValue(value, time = 300) {
    const [current, setValue] = useState()
    const timer = useRef()
    const lastTime = useRef()
    useEffect(() => {
        if (current === value) return
        if (!current && value !== undefined) {
            setValue(value)
        } else {
            clearTimeout(timer.current)
            timer.current = setTimeout(
                () => setValue(value),
                Math.max(0, time - (Date.now() - lastTime.current))
            )
        }
        lastTime.current = Date.now()
    }, [value, time, current])
    return current
}
