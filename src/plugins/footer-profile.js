import { Typography } from "@material-ui/core"
import { db } from "../lib/firebase"
import { useRecordStatic } from "../lib/useRecord"

const {
    Material: { TextField, Box, ThemeProvider, CssBaseline },
    Plugins: { PluginTypes, register },
    setFromEvent,
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.FOOTER, "Footer Profile", editor, runtime)

function editor({ parent, ...props }) {
    ReactDOM.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box mt={2}>
                <Typography gutterBottom>
                    The footer profile shows your display name and an extra line
                    of text you may specify below
                </Typography>
            </Box>
            <Box mt={2}>
                <TextField
                    value={settings.headLine ?? ""}
                    onChange={refresh(
                        setFromEvent((v) => (settings.headLine = v))
                    )}
                    helperText="If specified this appears under your display name"
                    label="Additional Headline"
                    variant="outlined"
                    fullWidth
                />
            </Box>
        </ThemeProvider>
    )
}
function runtime({ parent, ...props }) {
    ReactDOM.render(<Runtime {...props} />, parent)
}

function Runtime({ settings, article }) {
    const user = useRecordStatic(
        db.collection("userprofiles").doc(article.author)
    )
    return (
        !!user && (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    width={1}
                    pl={4}
                    pr={4}
                    color="inherit"
                    borderRadius={8}
                    p={1}
                >
                    <Typography variant="h6" component="h3">
                        {user.displayName}
                    </Typography>
                    {!!settings.headLine && (
                        <Typography gutterBottom variant="body2">
                            {settings.headLine}
                        </Typography>
                    )}
                </Box>
            </ThemeProvider>
        )
    )
}
