export function pick(fn) {
    return typeof fn === "string" ? (v) => v[fn] : fn
}
