import { AppBar, Box, Toolbar, Typography } from "@material-ui/core"
import { User } from "../lib/useUser"
import { SignInScreen } from "./parts/signin"

export function Administration({ children }) {
    return (
        <User shouldBeCreator={true} fallback={<SignInScreen />}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6" component="h1">
                        <strong>4C</strong> Widget Administration
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box width={1} p={4}>
                {children}
            </Box>
        </User>
    )
}
