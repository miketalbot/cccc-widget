import { Box, CardContent, TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { Bound } from "../../lib/Bound"
import { Plugins } from "../../lib/plugins"
import { raise } from "../../lib/raise"
import { useRefresh } from "../../lib/useRefresh"
import { useUserContext } from "../../lib/useUser"
import { UpdateWidget } from "./UpdateWidget"

export function PluginDetails({ article, onChange, type }) {
    const refresh = useRefresh(onChange)
    const user = useUserContext()
    const settings = (article.pluginSettings = article.pluginSettings || {})
    const typeSettings = (settings[article[type]] =
        settings[article[type]] || {})
    return (
        <Bound target={article} onChange={onChange} refresh={refresh}>
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
                        onChange={(...params) => {
                            onChange(...params)
                            raise("refresh-widget")
                        }}
                        settings={typeSettings}
                    />
                )}
                <UpdateWidget
                    article={article.uid}
                    user={user}
                    useArticle={article}
                />
            </CardContent>
        </Bound>
    )
}

function Editor({ plugin, article, onChange, settings }) {
    return (
        !!plugin && (
            <Box
                onKeyDown={(e) => e.stopPropagation()}
                width={1}
                ref={attachEditor}
            />
        )
    )

    function attachEditor(parent) {
        if (!parent) return
        setTimeout(() => {
            plugin.editor?.({ parent, article, onChange, settings })
        })
    }
}
