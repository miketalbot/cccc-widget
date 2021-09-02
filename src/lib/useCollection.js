import { useEffect, useState } from "react"

export function useCollection(collection, deps = []) {
    const [records, setRecords] = useState([])
    useEffect(() => {
        return collection.onSnapshot((rows) => {
            const output = []
            rows.forEach((row) => output.push(row.data()))
            setRecords(output)
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    return records
}
