import "./poll-editor"
import { loadPlugins } from "../lib/usePlugins"

import CONFIG from "../assets/standard-plugins.json"

loadPlugins(CONFIG.editor)
