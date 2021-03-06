import { db } from "../lib/firebase"
import { useRecordStatic } from "../lib/useRecord"

const {
    Material: {
        TextField,
        Box,
        Card,
        CardContent,
        Typography,
        ThemeProvider,
        CssBaseline
    },
    Plugins: { PluginTypes, register },
    setFromEvent,
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.MAIN, "Profile", editor, runtime)

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
                <Box m={2}>
                    <Card elevation={6}>
                        <CardContent>
                            <Typography
                                gutterBottom
                                variant="h5"
                                component="h2"
                            >
                                {user.displayName}
                            </Typography>
                            {!!settings.headLine && (
                                <Typography gutterBottom variant="body1">
                                    {settings.headLine}
                                </Typography>
                            )}
                            <Typography
                                gutterBottom
                                variant="body2"
                                color="textSecondary"
                                component="div"
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: user.description
                                    }}
                                />
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </ThemeProvider>
        )
    )
}
