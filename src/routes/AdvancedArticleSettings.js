import { TextField } from "@material-ui/core"
import { useRefresh } from "../lib/useRefresh"
import { setFromEvent } from "../lib/setFromEvent"

export function AdvancedArticleSettings({ onChange, reload, article }) {
    const refresh = useRefresh(onChange)
    return (
        <>
            <TextField
                variant="outlined"
                multiline
                fullWidth
                helperText="Add the url of each plugin on a new line"
                minRows={3}
                maxRows={10}
                onBlur={reload}
                label="Additional Plugins"
                value={article.additionalPlugins ?? ""}
                onChange={refresh(
                    setFromEvent((v) => (article.additionalPlugins = v))
                )}
            />
        </>
    )
}
