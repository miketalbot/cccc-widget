import "./App.css"
import { register, Router } from "./lib/routes"
import {
    Box,
    CircularProgress,
    CssBaseline,
    makeStyles
} from "@material-ui/core"
import { Suspense, lazy, useMemo } from "react"
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
register(
    "/admin/article/:id",
    lazy(() => import("./routes/admin-article"))
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

const useStyles = makeStyles({
    circle: {
        color: (props) => props.color,
        strokeLinecap: "round"
    }
})

function Loader({ size = 48, color = "white" }) {
    const classes = useStyles({ color })
    return (
        <Box
            display="flex"
            width={1}
            height={1}
            position="absolute"
            alignItems="center"
            justifyContent="center"
        >
            <CircularProgress size={size * 2} thickness={4} classes={classes} />
        </Box>
    )
}

export default App
