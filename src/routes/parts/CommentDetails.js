import { Box } from "@material-ui/core"
import { useRefresh } from "../../lib/useRefresh"
import { TextField } from "@material-ui/core"
import noop from "../../lib/noop"
import { setFromEvent } from "../../lib/setFromEvent"

export function CommentDetails({ article, onChange = noop }) {
    const refresh = useRefresh(onChange)
    return (
        <>
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
                        helperText="Separate tags with a comma.  Tags help us to recommend related articles."
                        label="Tags"
                        value={article.tags ?? ""}
                        onChange={refresh(setFromEvent(updateTags))}
                    />
                </Box>
            </Box>
        </>
    )

    function updateTags(v) {
        article.tags = v
        article.processedTags = v
            .toLowerCase()
            .split(",")
            .map((c) => c.trim())
            .filter((v) => !!v)
    }
}
