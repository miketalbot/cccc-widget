export function set(object, path, value) {
    const parts = path.split(".")
    for (let i = 0, l = parts.length - 1; i < l; i++) {
        const part = parts[i]
        object = object[part] = object[part] || {}
    }
    object[parts[parts.length - 1]] = value
}
