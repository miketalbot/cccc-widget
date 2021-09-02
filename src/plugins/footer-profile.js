import { Typography } from "@material-ui/core"

const {
    Material: { TextField, Box, ThemeProvider, CssBaseline },
    Plugins: { PluginTypes, register },
    setFromEvent,
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.FOOTER, "Profile", editor, runtime)

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
                    The footer profile shows the first couple of lines from your
                    personal profile and allows you to specify a short headline
                    specific for this article
                </Typography>
            </Box>
            <Box mt={2}>
                <TextField
                    value={settings.headLine ?? ""}
                    onChange={refresh(
                        setFromEvent((v) => (settings.headLine = v))
                    )}
                    helperText="If specified, this appears as a larger headline above your standard profile description"
                    label="Additional Headline"
                    variant="outlined"
                    fullWidth
                />
            </Box>
        </ThemeProvider>
    )
}

function runtime() {}
