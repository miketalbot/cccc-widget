import { useState } from "react"
import { useEvent } from "./useEvent"

export function useResponse(response) {
    const [current, setCurrent] = useState(response?.response || response)
    useEvent("response", () =>
        setCurrent({ ...(response?.response || response) })
    )
    return current
}
