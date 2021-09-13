import { Box, makeStyles, Typography } from "@material-ui/core"
import { useEffect, useRef } from "react"
import { useEvent } from "../../lib/useEvent"
import { useRefresh } from "../../lib/useRefresh"
import { useUserContext } from "../../lib/useUser"
import { renderWidget } from "../../runtime/widgetRenderer"

const useStyles = makeStyles({
    widget: {
        borderRadius: 8,
        overflow: "hidden",
        width: (props) => props.width,
        height: (props) => props.height,
        position: "relative"
    },
    frame: {
        zoom: (props) => (props.zoom ? 0.6 : 1)
    }
})

export function RenderWidget({ article, user, useArticle }) {
    const systemUser = useUserContext()
    user = user || systemUser
    useEvent("refresh-widget", useRefresh())
    const width = Math.min(600, window.innerWidth * 0.75)
    const eventHandler = useRef(null)
    useEffect(() => {
        return () => {
            if (eventHandler.current) {
                eventHandler.current()
                eventHandler.current = null
            }
        }
    }, [])
    const height = (width / 6) * 4
    const classes = useStyles({ width, height })
    return (
        <>
            <Box mt={2}>
                <Typography variant="caption" component="h2">
                    Widget Preview
                </Typography>
            </Box>
            <Box className={classes.frame} width={1} mt={2} display="flex">
                <div className={classes.widget} ref={attachRenderer} />
                <Box flex={1} />
            </Box>
        </>
    )
    async function attachRenderer(target) {
        if (eventHandler.current) {
            eventHandler.current()
            eventHandler.current = null
        }
        if (!target) return
        eventHandler.current = await renderWidget(
            target,
            article,
            user,
            useArticle
        )
    }
}
