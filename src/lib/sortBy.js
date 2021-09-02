import { pick } from "./pick"

export function sortBy(array, fn) {
    fn = pick(fn)
    return array.sort((a, b) => {
        const va = fn(a)
        const vb = fn(b)
        if (va < vb) return -1
        if (va > vb) return 1
        return 0
    })
}
