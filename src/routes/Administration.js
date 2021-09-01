import {
    AppBar,
    Box,
    Button,
    IconButton,
    makeStyles,
    Toolbar,
    Typography
} from "@material-ui/core"
import { navigate } from "../lib/routes"
import { User } from "../lib/useUser"
import { SignInScreen } from "./parts/signin"
import { MdHome } from "@react-icons/all-files/md/MdHome"

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
                    <Typography variant="h6" component="h1">
                        <strong>4C</strong> Widget Administration
                    </Typography>
                    <Box ml={2}>
                        <IconButton
                            color="inherit"
                            onClick={() => navigate("/admin")}
                        >
                            <MdHome />
                        </IconButton>
                    </Box>
                    <Box mr={1}>
                        <Button
                            color="inherit"
                            onClick={() => navigate("/admin/profile")}
                        >
                            Profile
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box width={1} p={4}>
                {children}
            </Box>
        </User>
    )
}
