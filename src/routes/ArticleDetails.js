import { Box, CardContent, TextField } from "@material-ui/core"
import HTMLEditor from "../lib/HtmlEditor"
import noop from "../lib/noop"
import { showNotification } from "../lib/notifications"
import { setFromEvent } from "../lib/setFromEvent"
import { useRefresh } from "../lib/useRefresh"
import { getTag } from "../lib/getTag"

export function ArticleDetails({ article, onChange = noop }) {
    const refresh = useRefresh(onChange)
    return (
        <>
            <CardContent>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="Name"
                    value={article.name ?? ""}
                    onChange={refresh(setFromEvent((v) => (article.name = v)))}
                />
            </CardContent>
            <CardContent>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="URL"
                    value={article.url ?? ""}
                    onChange={refresh(setFromEvent(updateArticle))}
                />
            </CardContent>
            <CardContent>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="Title"
                    value={article.title ?? ""}
                    onChange={refresh(setFromEvent((v) => (article.title = v)))}
                />
            </CardContent>
            <CardContent>
                <TextField
                    variant="outlined"
                    fullWidth
                    label="Image"
                    InputProps={{
                        endAdornment: !!article.image && (
                            <Box m={1} mr={-0.5} borderRadius={8} clone>
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
            </CardContent>
            <CardContent>
                <HTMLEditor
                    value={article.description || "<p></p>"}
                    onChange={refresh((v) => (article.description = v))}
                    label="Description"
                />
            </CardContent>
        </>
    )

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
