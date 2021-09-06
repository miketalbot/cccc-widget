import { db, view } from "../lib/firebase"
import logo from "../assets/4C_logo.jpg"
import { Plugins, PluginTypes } from "../lib/plugins"
import { raise } from "../lib/raise"
import { merge } from "../lib/merge"

export async function renderWidget(
    parent,
    id,
    user = { isAnonymous: true },
    useArticle = null
) {
    const definitionRef =
        user && !user.isAnonymous
            ? db
                  .collection("userarticles")
                  .doc(user.uid)
                  .collection("articles")
                  .doc(id)
            : db.collection("articles").doc(id)

    const definitionDoc = (parent._definitionDoc =
        parent._definitionDoc || (await definitionRef.get()))
    if (!definitionDoc.exists && !useArticle) {
        // Do some fallback
        return null
    }

    if (parent._uid !== user.uid) {
        if (!useArticle) {
            view(id).catch(console.error)
        }
    }
    // Get the actual data of the document
    const article = useArticle || definitionDoc.data()
    const response = {}
    const removeListener = (parent._removeListener =
        parent._removeListener ||
        db
            .collection("responses")
            .doc(id)
            .onSnapshot((update) => {
                const updatedData = update.data()
                Object.assign(response, updatedData)
                raise(`response-${id}`, response)
                raise(`response`, response)
            }))

    parent._uid = user.uid
    const author = await (
        await db.collection("userprofiles").doc(article.author).get()
    ).data()
    const holder = makeContainer(parent, article, user)
    holder.logoWidget.style.backgroundImage = `url(${logo})`
    if (author?.photoURL) {
        holder.avatarWidget.style.backgroundImage = `url(${author.photoURL})`
    }
    if (user.profileURL) {
        holder.avatarWidget.role = "button"
        holder.avatarWidget.style.cursor = "pointer"
        holder.avatarWidget["aria-label"] = "Link to authors profile page"
        holder.avatarWidget.onclick = () =>
            window.open(user.profileURL, "_blank", "noreferrer noopener")
    }
    article.pluginSettings = article.pluginSettings || {}
    renderPlugin(
        holder.mainWidget,
        PluginTypes.MAIN,
        article[PluginTypes.MAIN],
        article.pluginSettings[article[PluginTypes.MAIN]],
        article,
        user,
        response,
        !!useArticle
    )
    renderPlugin(
        holder.footerWidget,
        PluginTypes.FOOTER,
        article[PluginTypes.FOOTER],
        article.pluginSettings[article[PluginTypes.FOOTER]],
        article,
        user,
        response,
        !!useArticle
    )
    renderPlugin(
        holder.notificationWidget,
        PluginTypes.NOTIFICATION,
        article[PluginTypes.NOTIFICATION] || "defaultNotification",
        article.pluginSettings[article[PluginTypes.NOTIFICATION]] || {},
        article,
        user,
        response,
        !!useArticle
    )
    return () => {
        removeListener()
    }
}

function renderPlugin(
    parent,
    type,
    pluginName,
    settings,
    article,
    user,
    response,
    previewMode
) {
    if (!settings || !pluginName || !type || !parent || !article || !user)
        return
    const plugin = Plugins[type][pluginName]
    if (!plugin || !plugin.runtime) return
    plugin.runtime({
        parent,
        article,
        settings,
        type,
        pluginName,
        user,
        response,
        previewMode
    })
}

function makeContainer(parent, article) {
    parent = parent || document.body
    parent.style.background = `linear-gradient(45deg, ${
        article?.overrideGradientFrom ?? article?.gradientFrom ?? "#fe6b8b"
    } 30%, ${
        article?.overrideGradientTo ?? article?.gradientTo ?? "#ff8e53"
    } 90%)`
    if (parent._madeContainer) {
        parent._madeContainer.bottom.style.background =
            article.overrideBottomBackground ||
            article.bottomBackground ||
            "#333"
        parent._madeContainer.bottom.style.color =
            article.overrideBottomColor || article.bottomColor || "#fff"
        return parent._madeContainer
    }

    const main = document.createElement("main")
    Object.assign(main.style, {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden"
    })
    const top = document.createElement("div")
    Object.assign(top.style, {
        flex: 1,
        width: "100%",
        display: "flex",
        justifyContent: "stretch",
        overflow: "hidden"
    })
    main.appendChild(top)
    const mainWidget = document.createElement("section")
    Object.assign(mainWidget.style, {
        width: "66%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "stretch",
        position: "relative"
    })
    top.appendChild(mainWidget)
    const notificationWidget = document.createElement("section")
    Object.assign(notificationWidget.style, {
        width: "34%",
        maxWidth: "250px",
        overflowY: "hidden",
        overflowX: "visible"
    })
    top.appendChild(notificationWidget)
    const middle = document.createElement("div")
    Object.assign(middle.style, {
        height: "0px"
    })
    main.appendChild(middle)
    const bottom = document.createElement("div")
    Object.assign(bottom.style, {
        height: "76px",
        background:
            article.overrideBottomBackground ||
            article.bottomBackground ||
            "#333",
        color: article.overrideBottomColor || article.bottomColor || "#fff",
        marginLeft: "-4px",
        marginRight: "-4px",
        marginBottom: "-4px",
        boxShadow: "0 0 8px 0px #000A",
        padding: "8px",
        paddingTop: "4px",
        flexGrow: 0,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        width: "calc(100% + 8px)",
        overflow: "hidden",
        position: "relative"
    })
    main.appendChild(bottom)
    const avatarWidget = document.createElement("div")
    merge(avatarWidget.style, {
        borderRadius: "100%",
        width: "64px",
        height: "64px",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
    })
    avatarWidget["aria-label"] = "Author avatar"
    bottom.appendChild(avatarWidget)
    const footerWidget = document.createElement("section")
    Object.assign(footerWidget.style, {
        flex: 1
    })
    bottom.appendChild(footerWidget)
    const logoWidget = document.createElement("a")
    merge(logoWidget, {
        href: "https://4c.rocks",
        target: "_blank",
        "aria-label": "Link to 4C Rocks site"
    })
    merge(logoWidget.style, {
        display: "block",
        width: "64px",
        height: "64px",
        borderRadius: "8px",
        backgroundSize: "contain"
    })
    bottom.appendChild(logoWidget)
    parent.appendChild(main)

    return (parent._madeContainer = {
        main,
        bottom,
        mainWidget,
        footerWidget,
        logoWidget,
        avatarWidget,
        notificationWidget
    })
}
