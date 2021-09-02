export function getTag(document, tag) {
    const element = document.head.querySelector(`meta[property="${tag}"]`)
    if (element) {
        return element.content
    }
    return null
}
