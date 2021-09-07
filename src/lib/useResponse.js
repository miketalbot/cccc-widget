import { useEffect, useState } from "react"
import { db } from "./firebase"
import { useEvent } from "./useEvent"

export function useResponse(response) {
    const [current, setCurrent] = useState(response?.response || response)
    useEvent("response", (_, response) =>
        setCurrent({ ...(response?.response || response), notLoaded: false })
    )
    return current
}

export function useResponseFor(uid, method = "onSnapshot") {
    const [response, setResponse] = useState()
    useEffect(() => {
        if (method === "onSnapshot") {
            return db
                .collection("responses")
                .doc(uid)
                .onSnapshot((update) => {
                    setResponse(update.data())
                })
        } else {
            return db
                .collection("responses")
                .doc(uid)
                .get()
                .then((update) => {
                    setResponse(update.data())
                })
        }
    }, [uid, method])
    return response
}
