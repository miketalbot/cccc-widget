import "./App.css"
import { register, Router } from "./lib/routes"
import { CssBaseline } from "@material-ui/core"
import { Suspense, lazy } from "react"
import { User } from "./lib/useUser"
import { createTheme, ThemeProvider } from "@material-ui/core"
import { Dialogs } from "./lib/useDialog"
import { SnackBars } from "./lib/notifications"

const theme = createTheme({
    overrides: {
        MuiCssBaseline: {
            "@global": {
                body: {
                    background:
                        "linear-gradient(45deg, #fe6b8b 30%, #ff8e53 90%)",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed"
                }
            }
        }
    },
    palette: {
        background: {
            default: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
            paper: "#fff"
        },
        primary: {
            main: "#ae0b2b",
            contrastText: "#fff"
        }
    }
})

register(
    "/admin",
    lazy(() => import("./routes/admin"))
)
register(
    "/admin/profile",
    lazy(() => import("./routes/admin-profile"))
)
register(
    "/admin/articles",
    lazy(() => import("./routes/admin-articles"))
)

function App() {
    return (
        <User>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Suspense fallback={<div>Loading...</div>}>
                    <Router component={<main />} />
                    <Dialogs />
                    <SnackBars />
                </Suspense>
            </ThemeProvider>
        </User>
    )
}

export default App
