import "./profile"
import "./footer-profile"
import "./poll-runtime"
import "./notification-runtime"
import "./4c-runtime"
import "./html-runtime"
import { loadPlugins } from "../lib/usePlugins"

import CONFIG from "../assets/standard-plugins.json"

export async function initialize() {
    return await loadPlugins(CONFIG.runtime)
}
