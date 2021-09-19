import { Suspense } from "react"
import { lazy } from "react"
import reactDom from "react-dom"
import { PluginTypes, register } from "../lib/plugins"
const Runtime = lazy(() => import("./quiz-runtime-lazy"))

register(PluginTypes.MAIN, "Quiz", undefined, runtime)

function runtime({ parent, ...props }) {
    reactDom.render(
        <Suspense fallback={<div />}>
            <Runtime parent={parent} {...props} />
        </Suspense>,
        parent
    )
}
