import React from "react"
import ReactDOM from "react-dom"
import * as Material from "@material-ui/core"
import { register, navigate, useLocation } from "./routes"
import { raise } from "./raise"
import { useEvent, useDebouncedEvent } from "./useEvent"
window.CCCCFramework = {
    Material,
    Routes: { register, navigate, useLocation },
    Events: { useEvent, useDebouncedEvent, raise },
    React,
    ReactDOM
}
