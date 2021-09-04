export function merge(target, ...sources) {
    for (let source of sources) {
        mergeValue(target, source)
    }

    return target

    function innerMerge(target, source) {
        for (let [key, value] of Object.entries(source)) {
            if (key === "__proto__" || key === "constructor")
                throw new Error("Invalid Merge")
            target[key] = mergeValue(target[key], value)
        }
    }

    function mergeValue(targetValue, value) {
        if (Array.isArray(value)) {
            if (!Array.isArray(targetValue)) {
                return [...value]
            } else {
                for (let i = 0, l = value.length; i < l; i++) {
                    targetValue[i] = mergeValue(targetValue[i], value[i])
                }
                return targetValue
            }
        } else if (typeof value === "object") {
            if (targetValue && typeof targetValue === "object") {
                innerMerge(targetValue, value)
                return targetValue
            } else {
                return value ? { ...value } : value
            }
        } else {
            return value ?? targetValue ?? undefined
        }
    }
}
