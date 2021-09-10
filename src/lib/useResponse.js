import { useEffect, useState } from "react"
import { db } from "./firebase"
import { useEvent } from "./useEvent"

export function useResponse(response) {
    const [current, setCurrent] = useState(response?.response || response)
    useEvent("response", (_, response) => {
        setCurrent({ ...(response?.response || response), notLoaded: false })
    })
    return current
}

export function useCountsFor(uid, method = "onSnapshot") {
    return useInternal("counts", uid, method)
}

function useInternal(collection, uid, method) {
    const [response, setResponse] = useState()
    useEffect(() => {
        if (method === "onSnapshot") {
            return db
                .collection(collection)
                .doc(uid)
                .onSnapshot((update) => {
                    setResponse(update.data())
                })
        } else {
            return db
                .collection(collection)
                .doc(uid)
                .get()
                .then((update) => {
                    setResponse(update.data())
                })
        }
    }, [uid, method, collection])
    return response
}

export function useResponseFor(uid, method = "onSnapshot") {
    return useInternal("responses", uid, method)
}
