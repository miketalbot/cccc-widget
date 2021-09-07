import "./App.css"
import { register, Router } from "./lib/routes"
import { CssBaseline } from "@material-ui/core"
import { Suspense, lazy, useRef, useEffect, useState } from "react"
import { User, useUserContext } from "./lib/useUser"
import { ThemeProvider } from "@material-ui/core"
import { Dialogs } from "./lib/useDialog"
import { SnackBars } from "./lib/notifications"
import "./plugins"
import { theme } from "./lib/theme"
import { Loader } from "./lib/Loader"
import { renderWidget } from "./runtime/widgetRenderer"
import { initialize } from "./plugins"

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

register("/:id", RenderMe)
register("/:id/embed", RenderMeEmbed)

const fullScreen = {
    width: "100vw",
    height: "100vh",
    top: 0,
    left: 0,
    position: "fixed",
    overflow: "hidden"
}

function RenderMe({ id }) {
    const user = useUserContext()
    const ref = useRef()
    useEffect(() => {
        if (!user || !id || user.isAnonymous === undefined) return
        renderWidget(ref.current, id, user)
    }, [user, id])
    if (!id) {
        return null
    }
    return <div style={fullScreen} ref={ref} />
}

function RenderMeEmbed({ id }) {
    window.padRightToolbar = true
    return <RenderMe id={id} />
}

function App() {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        setTimeout(async () => {
            await initialize()
            setReady(true)
        })
    }, [])
    return (
        ready && (
            <User>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Suspense fallback={<Loader />}>
                        <Router component={<div />} />
                        <Dialogs />
                        <SnackBars />
                    </Suspense>
                </ThemeProvider>
            </User>
        )
    )
}

export default App
