import React, { useState } from "react"
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
import {
    db,
    recommend,
    respond,
    respondUnique,
    view,
    firebase,
    awardPoints
} from "./firebase"
import { Loader } from "./Loader"
import * as pie from "@nivo/pie"
import * as line from "@nivo/line"
import * as bar from "@nivo/bar"

function useResponse(response) {
    const [current, setCurrent] = useState(response?.response || response)
    useEvent("response", () =>
        setCurrent({ ...(response?.response || response) })
    )
    return current
}

window.Framework4C = {
    HTMLEditor,
    ImageUploadButton,
    Material,
    Loader,
    theme,
    setFromEvent,
    setFromValueParam,
    useRefresh,
    Nivo: {
        pie,
        bar,
        line
    },
    Routes: { register, navigate, useLocation },
    Events: { useEvent, useDebouncedEvent, raise },
    React,
    ReactDOM,
    Plugins: { register: pluginRegister, PluginTypes, Plugins },
    Interaction: {
        useResponse,
        awardPoints,
        respond,
        respondUnique
    },
    FireBase: {
        firebase,
        db,
        view,
        recommend
    }
}
