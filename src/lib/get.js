export function get(object, path, defaultValue) {
    const parts = path.split(".")
    for (let part of parts) {
        if (!object) return defaultValue
        object = object[part]
    }
    return object ?? defaultValue
}
