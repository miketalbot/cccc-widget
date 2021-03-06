import { Suspense } from "react"
import { lazy } from "react"
import reactDom from "react-dom"
import { PluginTypes, register } from "../lib/plugins"
const Runtime = lazy(() => import("./4c-runtime-lazy"))

register(PluginTypes.MAIN, "4C", editor, runtime)

function editor({ parent }) {
    reactDom.render(
        <Suspense fallback={<div />}>
            <div />
        </Suspense>,
        parent
    )
}

function runtime({ parent, ...props }) {
    reactDom.render(
        <Suspense fallback={<div />}>
            <Runtime {...props} />
        </Suspense>,
        parent
    )
}
