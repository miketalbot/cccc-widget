import { useEffect, useState } from "react"
import { showNotification } from "./notifications"

export function useRecord(docRef, deps = []) {
    const [record, setRecord] = useState()
    useEffect(() => {
        return docRef.onSnapshot((record) => {
            setRecord(record.data())
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    return [record, update]

    async function update(data = {}) {
        Object.assign(record, data)
        try {
            await docRef.set(record, {
                merge: true
            })
            return record
        } catch (e) {
            showNotification(e.message, { severity: "error" })
            return false
        }
    }
}
