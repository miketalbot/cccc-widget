import { Box, CircularProgress } from "@material-ui/core"
import { useStyles } from "../App"

export function Loader({ size = 48, color = "white" }) {
    const classes = useStyles({ color })
    return (
        <Box
            display="flex"
            width={1}
            height={1}
            position="absolute"
            alignItems="center"
            justifyContent="center"
        >
            <CircularProgress size={size * 2} thickness={4} classes={classes} />
        </Box>
    )
}
