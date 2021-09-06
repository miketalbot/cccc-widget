import { createApp } from "vue"
import App from "./App.vue"
import Render from "./Render.vue"

const {
    Plugins: { register, PluginTypes }
} = window.Framework4C || { Plugins: {} }

if (register) {
    register(PluginTypes.MAIN, "Vue Example", editor, runtime)
} else {
    createApp({
        ...App,
        data: () => ({}),
        updated: () => {
            console.log("Updated")
        }
    }).mount("#app")
}

function editor({ parent, settings, onChange }) {
    createApp({
        ...App,
        data() {
            // Initialize props for reactivity
            settings.message = settings.message || ""
            return settings
        },
        updated() {
            onChange()
        }
    }).mount(parent)
}

function runtime({ parent, settings }) {
    createApp({
        ...Render,
        el: parent,
        data() {
            return settings
        }
    }).mount(parent)
}

console.log("Loaded")
