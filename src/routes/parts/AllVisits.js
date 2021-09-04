import { Odometer } from "../../lib/odometer"
import { useCollection } from "../../lib/useCollection"
import { db } from "../../lib/firebase"
import { Box, Typography } from "@material-ui/core"

export function AllVisits() {
    const allTags = useCollection(
        db.collection("tags").where("special", "==", true)
    )
    const totalViews = allTags.reduce((c, a) => c + (a?.visits || 0), 0)
    return (
        !!totalViews && (
            <Box display="flex" flexDirection="column">
                <Typography variant="overline" gutterBottom>
                    4C Visits
                </Typography>
                <Odometer theme="car">{totalViews}</Odometer>
            </Box>
        )
    )
}
