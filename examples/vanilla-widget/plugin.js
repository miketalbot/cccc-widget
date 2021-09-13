const {
    Plugins: { register, PluginTypes },
    Interaction: { respondUnique }
} = window.Framework4C

register(PluginTypes.MAIN, "Article", editor, runtime)

function editor({ settings, onChange, parent }) {
    const div = document.createElement("div")
    const label = document.createElement("label")
    label.innerText = "Show Like Button"
    const input = document.createElement("input")
    input.type = "checkbox"
    input.checked = settings.showLikeButton
    input.onclick = () => {
        settings.showLikeButton = input.checked
        onChange()
    }
    label.appendChild(input)
    div.appendChild(label)
    div.style.marginTop = "10px"
    parent.innerHTML = ""
    parent.appendChild(div)
}

function runtime({ parent, settings, article, user, response }) {
    const div = document.createElement("div")
    div.style.padding = "8px"
    div.innerHTML = `
        <h2>${article.title}</h2>
        <h5>by ${user.displayName}</h5>
    `
    const loading = document.createElement("div")
    loading.innerHTML = `<strong>Registering your choice</strong>`
    loading.style.display = "none"
    div.appendChild(loading)
    if (settings.showLikeButton) {
        const button = document.createElement("button")
        window.addEventListener("response", () => {
            button.innerText = `${
                response.responses?.Like?.[user.uid] ? "Unlike" : "Like"
            } (${countLikes(response)})`
        })
        button.innerText = `Like (${countLikes(response)})`
        button.onclick = () => {
            loading.style.display = "block"
            respondUnique(
                article.uid,
                "Like",
                !response.responses?.Like?.[user.uid]
            ).finally(() => (loading.style.display = "none"))
        }
        div.appendChild(button)
    }
    parent.innerHTML = ""
    parent.appendChild(div)
}

function countLikes(response) {
    return Object.values(response.responses?.Like ?? []).filter((v) => !!v)
        .length
}
