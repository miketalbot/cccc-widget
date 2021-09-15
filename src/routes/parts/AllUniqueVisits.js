import { Odometer } from "../../lib/odometer"
import { useCollection } from "../../lib/useCollection"
import { db } from "../../lib/firebase"
import { Box, Typography } from "@material-ui/core"

export function AllUniqueVisits() {
    const allTags = useCollection(
        db.collection("tags").where("special", "==", true)
    )
    const totalViews = allTags.reduce((c, a) => c + (a?.uniqueVisits || 0), 0)
    return (
        !!totalViews && (
            <Box display="flex" flexDirection="column">
                <Typography variant="overline" gutterBottom>
                    4C Unique Views
                </Typography>
                <Box alignSelf="flex-end">
                    <Odometer theme="car">{totalViews}</Odometer>
                </Box>
            </Box>
        )
    )
}
