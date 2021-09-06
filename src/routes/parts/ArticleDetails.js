import { Box, makeStyles, TextField } from "@material-ui/core"
import HTMLEditor from "../../lib/HtmlEditor"
import noop from "../../lib/noop"
import { showNotification } from "../../lib/notifications"
import { setFromEvent } from "../../lib/setFromEvent"
import { useRefresh } from "../../lib/useRefresh"
import { getTag } from "../../lib/getTag"
import { uniqBy } from "../../lib/uniqBy"
import { BoundStandardSwitch } from "../../lib/bound-components"

const useStyles = makeStyles({
    root: {}
})

export function ArticleDetails({ article, onChange = noop }) {
    const classes = useStyles()
    const refresh = useRefresh(onChange)
    return (
        <>
            <BoundStandardSwitch field="enabled" default={true} />

            <Box mt={2} display="flex">
                <Box mr={1} flex={1}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        label="Name"
                        value={article.name ?? ""}
                        onChange={refresh(
                            setFromEvent((v) => (article.name = v))
                        )}
                    />
                </Box>
                <Box>
                    <TextField
                        variant="outlined"
                        fullWidth
                        helperText="Separate tags with a comma.  Tags help us to recommend your article."
                        label="Tags"
                        value={article.tags ?? ""}
                        onChange={refresh(setFromEvent(updateTags))}
                    />
                </Box>
            </Box>
            <Box mt={2}>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="URL"
                    value={article.url ?? ""}
                    onBlur={() => updateArticle(article.url)}
                    onChange={refresh(setFromEvent((v) => (article.url = v)))}
                />
            </Box>
            <Box mt={2}>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="Title"
                    value={article.title ?? ""}
                    onChange={refresh(setFromEvent((v) => (article.title = v)))}
                />
            </Box>
            <Box mt={2}>
                <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    classes={classes}
                    label="Image"
                    InputProps={{
                        classes,
                        endAdornment: !!article.image && (
                            <Box m={1} mr={-0.5} borderRadius={4} clone>
                                <img
                                    alt="Preview"
                                    width={150}
                                    src={article.image}
                                />
                            </Box>
                        )
                    }}
                    value={article.image ?? ""}
                    onChange={refresh(setFromEvent((v) => (article.image = v)))}
                />
            </Box>
            <Box mt={2}>
                <HTMLEditor
                    value={article.description || "<p></p>"}
                    onChange={refresh((v) => (article.description = v))}
                    label="Description"
                />
            </Box>
        </>
    )

    function updateTags(v) {
        article.tags = v
        article.processedTags = uniqBy(
            v
                .toLowerCase()
                .split(",")
                .map((c) => c.trim())
                .filter((v) => !!v),
            (v) => v
        )
    }

    async function updateArticle(url) {
        article.url = url
        try {
            const response = await fetch(url)
            if (!response.ok) {
                return
            }
            const content = await response.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(content, "text/html")
            const title = getTag(doc, "og:title")
            const description = getTag(doc, "og:description")
            const image = getTag(doc, "og:image")
            article.title = title
            article.description = description
            article.image = image
            refresh()
        } catch (e) {
            showNotification(
                "A problem occurred retrieving the url: " + e.message,
                {
                    severity: "error"
                }
            )
        }
    }
}
