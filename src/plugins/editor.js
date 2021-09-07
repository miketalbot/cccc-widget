import "./poll-editor"
import "./html-editor"
import "./quiz-editor"
import { loadPlugins } from "../lib/usePlugins"

import CONFIG from "../assets/standard-plugins.json"

loadPlugins(CONFIG.editor)
