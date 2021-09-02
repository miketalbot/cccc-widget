export function ensureArray(v) {
    if (Array.isArray(v)) return v
    return [v].filter((v) => v !== undefined)
}
