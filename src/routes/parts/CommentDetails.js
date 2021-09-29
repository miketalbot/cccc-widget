import { Box, Grid } from "@material-ui/core"
import { useRefresh } from "../../lib/useRefresh"
import { TextField } from "@material-ui/core"
import noop from "../../lib/noop"
import { setFromEvent } from "../../lib/setFromEvent"
import { uniqBy } from "../../lib/uniqBy"

export function CommentDetails({ article, onChange = noop }) {
    const refresh = useRefresh(onChange)
    return (
        <>
            <Box mt={2} display="flex">
                <Grid container spacing={2}>
                    <Grid item md={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Name"
                            value={article.name ?? ""}
                            onChange={refresh(
                                setFromEvent((v) => (article.name = v))
                            )}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            helperText="Separate tags with a comma.  Tags help us to recommend your article."
                            label="Tags"
                            value={article.tags ?? ""}
                            onChange={refresh(setFromEvent(updateTags))}
                        />
                    </Grid>
                </Grid>
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
}
