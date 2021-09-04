import { useEffect, useState } from "react"
import { db } from "./firebase"
import { useEvent } from "./useEvent"

export function useResponse(response) {
    const [current, setCurrent] = useState(response?.response || response)
    useEvent("response", (_, response) =>
        setCurrent({ ...(response?.response || response) })
    )
    return current
}

export function useResponseFor(uid, method = "onSnapshot") {
    const [response, setResponse] = useState()
    useEffect(() => {
        return db
            .collection("responses")
            .doc(uid)
            [method]((update) => {
                setResponse(update.data())
            })
    }, [uid])
    return response
}
