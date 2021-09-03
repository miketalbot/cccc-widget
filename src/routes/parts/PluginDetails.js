import { Box, CardContent, TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { Plugins } from "../../lib/plugins"
import { useRefresh } from "../../lib/useRefresh"
import { useUserContext } from "../../lib/useUser"
import { RenderWidget } from "./RenderWidget"

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

function Editor({ plugin, article, onChange, settings }) {
    return !!plugin && <Box width={1} ref={attachEditor} />

    function attachEditor(parent) {
        if (!parent) return
        plugin.editor({ parent, article, onChange, settings })
    }
}
