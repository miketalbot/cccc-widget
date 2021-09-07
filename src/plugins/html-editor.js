import { Box, CssBaseline, ThemeProvider } from "@material-ui/core"
import reactDom from "react-dom"
import { PluginTypes, register } from "../lib/plugins"
import { theme } from "../lib/theme"
import { useRefresh } from "../lib/useRefresh"
import { BoundHTMLEditor } from "../lib/bound-components"
import { Bound } from "../lib/Bound"

register(PluginTypes.MAIN, "HTML", editor, undefined)

function editor({ parent, ...props }) {
    reactDom.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Bound target={settings} onChange={onChange} refresh={refresh}>
                <Box mt={2}>
                    <BoundHTMLEditor field="htmlContent" />
                </Box>
            </Bound>
        </ThemeProvider>
    )
}
