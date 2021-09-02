import { createTheme } from "@material-ui/core"

export const theme = createTheme({
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
