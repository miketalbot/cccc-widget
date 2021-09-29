import { useDebouncedEvent } from "../../lib/useEvent"
import { useRefresh } from "../../lib/useRefresh"
import { RenderWidget } from "./RenderWidget"
import React from "react"
import { Box } from "@material-ui/core"

export function UpdateWidget(props) {
    const refresh = useRefresh()
    useDebouncedEvent("refresh-widget", refresh, 700)

    return (
        <>
            <Box display={{ xs: "none", sm: "block" }} width={1}>
                <InnerWidget {...props} id={refresh.id} />
            </Box>
        </>
    )
}

const InnerWidget = React.memo(
    function (props) {
        return <RenderWidget {...props} />
    },
    (a, b) => a.id === b.id
)
