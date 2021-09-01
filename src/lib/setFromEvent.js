export function setFromEvent(fn) {
    return (e) => fn(e.target.value)
}
