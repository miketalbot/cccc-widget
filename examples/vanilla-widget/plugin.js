const {
    Plugins: { register, PluginTypes }
} = window.Framework4C

register(PluginTypes.MAIN, "Article", editor, runtime)

function editor({ settings, onChange, parent }) {
    const div = document.createElement("div")
    const label = document.createElement("label")
    label.innerText = "Show Like Button"
    const input = document.createElement("input")
    input.type = "checkbox"
    input.onchange = () => {
        settings.showLikeButton = input.checked
        onChange()
    }
    label.appendChild(input)
    div.appendChild(label)
    div.style.marginTop = "10px"
    parent.innerHTML = ""
    parent.appendChild(div)
}

function runtime({ parent, settings, article, user }) {
    const div = document.createElement("div")
    div.style.padding = "8px"
    const extra = settings.showLikeButton
        ? `<button id="button">Like</button>`
        : ""
    div.innerHTML = `
        <h2>${article.title}</h2>
        <h5>by ${user.displayName}</h5>
        ${extra}
    `
    parent.innerHTML = ""
    parent.appendChild(div)
}
