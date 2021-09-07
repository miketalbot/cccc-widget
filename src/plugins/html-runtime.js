import { Suspense } from "react"
import { lazy } from "react"
import reactDom from "react-dom"
import { PluginTypes, register } from "../lib/plugins"
const Runtime = lazy(() => import("./html-runtime-lazy"))

register(PluginTypes.MAIN, "HTML", undefined, runtime)

function runtime({ parent, ...props }) {
    reactDom.render(
        <Suspense fallback={<div />}>
            <Runtime {...props} />
        </Suspense>,
        parent
    )
}
