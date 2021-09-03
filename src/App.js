import "./App.css"
import { register, Router } from "./lib/routes"
import { CssBaseline } from "@material-ui/core"
import { Suspense, lazy } from "react"
import { User } from "./lib/useUser"
import { ThemeProvider } from "@material-ui/core"
import { Dialogs } from "./lib/useDialog"
import { SnackBars } from "./lib/notifications"
import "./plugins"
import { theme } from "./lib/theme"
import { Loader } from "./lib/Loader"

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
register(
    "/admin/article/:id",
    lazy(() => import("./routes/admin-article"))
)
register(
    "/admin/comments",
    lazy(() => import("./routes/admin-comments"))
)
register(
    "/admin/comment/:id",
    lazy(() => import("./routes/admin-comment"))
)

function App() {
    return (
        <User>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Suspense fallback={<Loader />}>
                    <Router component={<main />} />
                    <Dialogs />
                    <SnackBars />
                </Suspense>
            </ThemeProvider>
        </User>
    )
}

export default App
