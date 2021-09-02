import { raise } from "./raise"

export const PluginTypes = {
    MAIN: "main",
    FOOTER: "footer"
}

export const Plugins = {
    [PluginTypes.MAIN]: {},
    [PluginTypes.FOOTER]: {}
}

export function register(type, name, editor, runtime) {
    console.log("Register", type, name)
    Plugins[type][name] = { name, editor, type, runtime }
    raise("plugins-updated")
}
