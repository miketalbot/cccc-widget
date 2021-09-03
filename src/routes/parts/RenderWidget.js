import {
    Box,
    FormControlLabel,
    makeStyles,
    Switch,
    Typography
} from "@material-ui/core"
import { useEffect, useRef, useState } from "react"
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
    const width = Math.min(600, window.innerWidth * 0.75)
    const [zoom, setZoom] = useState(useArticle?.zoom ?? true)
    const eventHandler = useRef(null)
    if (useArticle) {
        useArticle.zoom = zoom
    }
    useEffect(() => {
        if (eventHandler.current) {
            eventHandler.current()
            eventHandler.current = null
        }
    }, [])
    const height = (width / 6) * 4
    const classes = useStyles({ width, height, zoom })
    return (
        <>
            <Box mt={2}>
                <Typography variant="caption" component="h3">
                    Widget Preview
                </Typography>
            </Box>
            <Box className={classes.frame} width={1} mt={2} display="flex">
                <div className={classes.widget} ref={attachRenderer} />
                <Box flex={1} />
            </Box>
            <Box mt={2}>
                <FormControlLabel
                    control={
                        <Switch
                            color="default"
                            checked={zoom}
                            onChange={() => setZoom((zoom) => !zoom)}
                        />
                    }
                    label="Small Preview"
                />
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
