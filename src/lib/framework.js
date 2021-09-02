import React from "react"
import ReactDOM from "react-dom"
import * as Material from "@material-ui/core"
import { register, navigate, useLocation } from "./routes"
import { raise } from "./raise"
import { useEvent, useDebouncedEvent } from "./useEvent"
import { register as pluginRegister, PluginTypes, Plugins } from "./plugins"
import { theme } from "./theme"
import { setFromEvent, setFromValueParam } from "./setFromEvent"
import { useRefresh } from "./useRefresh"
import HTMLEditor from "./HtmlEditor"
import { ImageUploadButton } from "./uploadButton"
window.Framework4C = {
    HTMLEditor,
    ImageUploadButton,
    Material,
    theme,
    setFromEvent,
    setFromValueParam,
    useRefresh,
    Routes: { register, navigate, useLocation },
    Events: { useEvent, useDebouncedEvent, raise },
    React,
    ReactDOM,
    Plugins: { register: pluginRegister, PluginTypes, Plugins }
}

console.log(window.Framework4C)
