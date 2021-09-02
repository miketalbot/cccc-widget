import { Box, TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { Plugins } from "../lib/plugins"
import { useRefresh } from "../lib/useRefresh"

export function PluginDetails({ article, onChange, type }) {
    const refresh = useRefresh(onChange)
    const settings = (article.pluginSettings = article.pluginSettings || {})
    const typeSettings = (settings[article[type]] =
        settings[article[type]] || {})
    return (
        <>
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
                    onChange={onChange}
                    settings={typeSettings}
                />
            )}
        </>
    )
}

function Editor({ plugin, article, onChange, settings }) {
    return !!plugin && <Box width={1} ref={attachEditor} />

    function attachEditor(parent) {
        if (!parent) return
        plugin.editor({ parent, article, onChange, settings })
    }
}
