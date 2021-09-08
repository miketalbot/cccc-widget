import { useDebouncedEvent } from "../../lib/useEvent"
import { useRefresh } from "../../lib/useRefresh"
import { RenderWidget } from "./RenderWidget"
import React from "react"

export function UpdateWidget(props) {
    const refresh = useRefresh()
    useDebouncedEvent("refresh-widget", refresh, 700)

    return <InnerWidget {...props} id={refresh.id} />
}

const InnerWidget = React.memo(
    function (props) {
        return <RenderWidget {...props} />
    },
    (a, b) => a.id === b.id
)
