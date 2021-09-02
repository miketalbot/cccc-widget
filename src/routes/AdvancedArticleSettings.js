import { CardContent, TextField } from "@material-ui/core"
import { useRefresh } from "../lib/useRefresh"
import { setFromEvent } from "../lib/setFromEvent"
import { useState } from "react"

export function AdvancedArticleSettings({ onChange, reload, article }) {
    const refresh = useRefresh(onChange)
    const [value, setValue] = useState(article.additionalPlugins ?? "")
    return (
        <CardContent>
            <TextField
                variant="outlined"
                multiline
                fullWidth
                helperText="Add the url of each plugin on a new line"
                minRows={3}
                maxRows={10}
                onBlur={refresh(() => {
                    article.additionalPlugins = value
                    reload()
                })}
                label="Additional Plugins"
                value={value}
                onChange={setFromEvent(setValue)}
            />
        </CardContent>
    )
}
