import {
    Box,
    CardContent,
    FormControlLabel,
    makeStyles,
    Switch,
    TextField,
    Typography
} from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { useState } from "react"
import { Plugins } from "../lib/plugins"
import { useRefresh } from "../lib/useRefresh"
import { useUserContext } from "../lib/useUser"
import { renderWidget } from "../runtime/widgetRenderer"

export function PluginDetails({ article, onChange, type }) {
    const refresh = useRefresh(onChange)
    const user = useUserContext()
    const settings = (article.pluginSettings = article.pluginSettings || {})
    const typeSettings = (settings[article[type]] =
        settings[article[type]] || {})
    return (
        <CardContent>
            <Autocomplete
                onChange={refresh((_, v) => (article[type] = v))}
                value={article[type] ?? ""}
                renderInput={(p) => (
                    <TextField
                        variant="outlined"
                        label="Plugin"
                        fullWidth
                        {...p}
                    />
                )}
                options={Object.keys(Plugins[type]).sort()}
            />
            {article[type] && (
                <Editor
                    plugin={Plugins[type][article[type]]}
                    article={article}
                    onChange={refresh}
                    settings={typeSettings}
                />
            )}
            <RenderWidget
                article={article.uid}
                user={user}
                useArticle={article}
            />
        </CardContent>
    )
}

const useStyles = makeStyles({
    widget: {
        borderRadius: 8,
        overflow: "hidden",
        width: (props) => props.width,
        height: (props) => props.height
    },
    frame: {
        zoom: (props) => (props.zoom ? 0.6 : 1)
    }
})

function RenderWidget({ article, user, useArticle }) {
    const width = Math.min(600, window.innerWidth * 0.75)
    const [zoom, setZoom] = useState(useArticle?.zoom)
    if (useArticle) {
        useArticle.zoom = zoom
    }
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
    function attachRenderer(target) {
        if (!target) return
        renderWidget(target, article, user, useArticle)
    }
}

function Editor({ plugin, article, onChange, settings }) {
    return !!plugin && <Box width={1} ref={attachEditor} />

    function attachEditor(parent) {
        if (!parent) return
        plugin.editor({ parent, article, onChange, settings })
    }
}
