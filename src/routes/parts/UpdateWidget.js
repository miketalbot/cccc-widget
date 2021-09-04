import { useDebouncedEvent } from "../../lib/useEvent"
import { useRefresh } from "../../lib/useRefresh"
import { RenderWidget } from "./RenderWidget"
import React from "react"

export function UpdateWidget(props) {
    const refresh = useRefresh()
    useDebouncedEvent("refresh-widget", refresh, 500)
    return (
        <div id="updateWidget">
            <RenderWidget {...props} />
        </div>
    )
}
