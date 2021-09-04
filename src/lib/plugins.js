import { raise } from "./raise"

export const PluginTypes = {
    MAIN: "main",
    FOOTER: "footer",
    NOTIFICATION: "notification"
}

export const Plugins = {
    [PluginTypes.MAIN]: {},
    [PluginTypes.FOOTER]: {},
    [PluginTypes.NOTIFICATION]: {}
}

export function register(type, name, editor, runtime) {
    const existing = Plugins[type][name] || {}
    Plugins[type][name] = {
        name,
        editor: editor || existing.editor,
        type,
        runtime: runtime || existing.runtime
    }
    raise("plugins-updated")
}
