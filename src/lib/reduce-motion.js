import { raise } from "./raise"

const mediaQuery =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)")
mediaQuery.addEventListener("change", () => {
    raise("reduce-motion", reduceMotion())
})

export function reduceMotion() {
    return mediaQuery.matches
}
