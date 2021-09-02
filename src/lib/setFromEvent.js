export function setFromEvent(fn) {
    return (e) => fn(e.target.value)
}

export function setFromValueParam(fn) {
    return (e, v) => fn(v)
}
