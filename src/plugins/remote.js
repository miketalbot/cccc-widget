const {
    Material: { TextField, Box, ThemeProvider, CssBaseline },
    Plugins: { PluginTypes, register },
    setFromEvent,
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.MAIN, "Remote", editor, runtime)

function editor({ parent, ...props }) {
    ReactDOM.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box mt={2}>
                <TextField
                    value={settings.headLine ?? ""}
                    onChange={refresh(
                        setFromEvent((v) => (settings.headLine = v))
                    )}
                    helperText="If specified, this appears as a large headline above your standard profile description"
                    label="Additional Headline"
                    variant="outlined"
                    fullWidth
                />
            </Box>
        </ThemeProvider>
    )
}

function runtime() {}
