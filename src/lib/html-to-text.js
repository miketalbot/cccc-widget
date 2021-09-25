const div = document.createElement("div")

export function htmlToText(html) {
    div.innerHTML = html
    return div.innerText.trim()
}
