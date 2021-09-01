import { useRef, useState } from "react"

export const CancelAsync = Symbol("CancelAsync")

function isEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
}

export function useAsync(
    promiseProducer,
    defaultValue = null,
    refId = "standard"
) {
    promiseProducer =
        typeof promiseProducer !== "function"
            ? async () => promiseProducer
            : promiseProducer
    const executionId = useRef()
    const key = typeof refId === "object" ? JSON.stringify(refId) : refId
    const value = useRef(defaultValue)
    const [, setResult] = useState(0)
    if (key !== executionId.current) {
        runFunctions()
    }
    // useEffect(runFunctions, [key])
    return value.current

    function runFunctions() {
        executionId.current = key
        value.current = defaultValue
        runMe().catch(console.error)

        async function runMe() {
            try {
                let result = await promiseProducer()
                if (result === CancelAsync) {
                    return
                }
                if (isEqual(value.current, result || defaultValue || result)) {
                    return
                }
                if (executionId.current === key) {
                    value.current = result || defaultValue || result
                    setResult((prev) => prev + 1)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }
}

useAsync.bind = function (fn, defaultValue = null, refId = "standard") {
    return function (...params) {
        return useAsync(
            async () => {
                return fn(...params)
            },
            defaultValue,
            refId
        )
    }
}

export default useAsync
