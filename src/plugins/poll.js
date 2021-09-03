import { Button } from "@material-ui/core"
import { useState } from "react"

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
    Loader,
    Plugins: { PluginTypes, register },
    Interaction: { respondUnique, useResponse },
    setFromEvent,
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.MAIN, "Poll", editor, runtime)

function editor({ parent, ...props }) {
    ReactDOM.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box mt={2}>Put poll answers here</Box>
        </ThemeProvider>
    )
}

function runtime({ parent, ...props }) {
    ReactDOM.render(<Runtime {...props} />, parent)
}

function Runtime({ settings, user, response, article, previewMode }) {
    const [showLoader, setShowLoader] = useState()
    const { responses: { Poll } = {} } = useResponse(response)
    const { [user.uid]: myResponse } = Poll || {}
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {showLoader ? (
                <Loader caption={showLoader} />
            ) : (
                <Box m={2} width={1}>
                    {myResponse ? (
                        <>
                            <div>Results</div>
                            {previewMode && (
                                <Button onClick={reset}>Reset</Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Box>
                                <Button onClick={press1}>One</Button>
                            </Box>
                            <Box>
                                <Button onClick={press2}>Two</Button>
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </ThemeProvider>
    )

    async function reset() {
        setShowLoader("Resetting")
        await respondUnique(article.uid, "Poll", null)
        setShowLoader(false)
    }

    async function press1() {
        setShowLoader("Registering your choice")
        await respondUnique(article.uid, "Poll", { pressed: "1" })
        setShowLoader(false)
    }
    async function press2() {
        setShowLoader("Registering your choice")
        await respondUnique(article.uid, "Poll", { pressed: "2" })
        setShowLoader(false)
    }
}
