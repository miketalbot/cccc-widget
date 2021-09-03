import { pick } from "./pick"

export function uniqBy(target, fn) {
    fn = pick(fn)
    const dedupe = new Set()
    return target.filter((v) => {
        const k = fn(v)
        if (dedupe.has(k)) return false
        dedupe.add(k)
        return true
    })
}
