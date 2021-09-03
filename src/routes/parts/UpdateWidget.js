import { useEvent } from "../../lib/useEvent"
import { useRefresh } from "../../lib/useRefresh"
import { RenderWidget } from "./RenderWidget"

export function UpdateWidget(props) {
    const refresh = useRefresh()
    useEvent("refresh-widget", refresh)
    return <RenderWidget {...props} />
}
