import {
    AppBar,
    Avatar,
    Box,
    IconButton,
    makeStyles,
    Toolbar,
    Typography
} from "@material-ui/core"
import { navigate } from "../lib/routes"
import { User } from "../lib/useUser"
import { SignInScreen } from "./parts/signin"
import { MdPerson } from "react-icons/md"
import { MdHome } from "react-icons/md"
import { FaRegNewspaper } from "react-icons/fa"
import logo from "../assets/4C_logo.jpg"

const useStyles = makeStyles({
    appBar: {
        background: "#444",
        color: "white"
    }
})

export function Administration({ children }) {
    const classes = useStyles()
    return (
        <User shouldBeCreator={true} fallback={<SignInScreen />}>
            <AppBar className={classes.appBar} position="static">
                <Toolbar variant="dense">
                    <Box mr={2}>
                        <Avatar size="large" src={logo} />
                    </Box>
                    <Typography variant="h6" component="h1">
                        Widget
                    </Typography>
                    <Box ml={1}>
                        <IconButton
                            aria-label="Home"
                            color="inherit"
                            onClick={() => navigate("/admin")}
                        >
                            <MdHome />
                        </IconButton>
                    </Box>
                    <Box flex={1} />
                    <Box mr={1}>
                        <IconButton
                            aria-label="Articles"
                            color="inherit"
                            onClick={() => navigate("/admin/articles")}
                        >
                            <FaRegNewspaper />
                        </IconButton>
                    </Box>
                    <Box mr={1}>
                        <IconButton
                            aria-label="Profile"
                            color="inherit"
                            onClick={() => navigate("/admin/profile")}
                        >
                            <MdPerson />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box width={1} p={4}>
                {children}
            </Box>
        </User>
    )
}
