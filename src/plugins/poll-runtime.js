import { Box, Button, CssBaseline, ThemeProvider } from "@material-ui/core"
import { useState } from "react"
import reactDom from "react-dom"
import { respondUnique } from "../lib/firebase"
import { Loader } from "../lib/Loader"
import { PluginTypes, register } from "../lib/plugins"
import { theme } from "../lib/theme"
import { useResponse } from "../lib/useResponse"

register(PluginTypes.MAIN, "Poll", undefined, runtime)

function runtime({ parent, ...props }) {
    reactDom.render(<Runtime {...props} />, parent)
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
