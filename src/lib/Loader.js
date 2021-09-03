import {
    Box,
    CircularProgress,
    makeStyles,
    Typography
} from "@material-ui/core"
const useStyles = makeStyles({
    circle: {
        color: (props) => props.color,
        strokeLinecap: "round"
    }
})

export function Loader({ size = 48, color = "white", caption }) {
    const classes = useStyles({ color })
    return (
        <Box
            display="flex"
            flexDirection="column"
            width={1}
            height={1}
            left={0}
            right={0}
            top={0}
            bottom={0}
            position="absolute"
            alignItems="center"
            justifyContent="center"
        >
            <CircularProgress size={size * 2} thickness={4} classes={classes} />
            {!!caption && (
                <Box color="white" mt={4}>
                    <Typography variant="h6" component="span">
                        {caption}
                    </Typography>
                </Box>
            )}
        </Box>
    )
}
