import { Box, CardContent, TextField } from "@material-ui/core"
import { Autocomplete } from "@material-ui/lab"
import { useEffect, useState } from "react"
import { Bound } from "../../lib/Bound"
import { db } from "../../lib/firebase"
import { Plugins } from "../../lib/plugins"
import { raise } from "../../lib/raise"
import { useRefresh } from "../../lib/useRefresh"
import { useUserContext } from "../../lib/useUser"
import { UpdateWidget } from "./UpdateWidget"

export function PluginDetails({ article, onChange, type }) {
    const refresh = useRefresh(onChange, () => raise("refresh-widget"))
    const user = useUserContext()
    const settings = (article.pluginSettings = article.pluginSettings || {})
    const typeSettings = (settings[article[type]] =
        settings[article[type]] || {})
    return (
        <Bound target={article} onChange={onChange} refresh={refresh}>
            <Box display={{ xs: "none", sm: "block" }}>
                <CardContent>
                    <Autocomplete
                        onChange={refresh((_, v) => (article[type] = v))}
                        value={article[type] ?? ""}
                        renderInput={(p) => (
                            <TextField
                                variant="outlined"
                                label="Plugin"
                                helperText="Change the widget by choosing an option from this list"
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
            </Box>
            <Box display={{ xs: "block", sm: "none" }}>
                Please make the display wider to view
            </Box>
        </Bound>
    )
}

function Editor({ plugin, article, onChange, settings }) {
    const [response] = useState({})
    useEffect(() => {
        return db
            .collection("responses")
            .doc(article.uid)
            .onSnapshot((update) => {
                const updatedData = update.data()
                Object.assign(response, updatedData)
                raise(`response-${article.uid}`, response)
                raise(`response`, response)
            })
    }, [article, response])
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
            plugin.editor?.({ parent, article, onChange, settings, response })
        })
    }
}
