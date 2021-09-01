import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Container
} from "@material-ui/core"
import firebase from "firebase/app"
import { StyledFirebaseAuth } from "react-firebaseui"

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: "popup",
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID
    ]
}

export function SignInScreen() {
    return (
        <Container>
            <Box mt={6}>
                <Card elevation={10}>
                    <CardHeader
                        title="4C Widget"
                        subheader="Content Creator Login"
                    />
                    <CardContent>
                        <Box width={1} clone>
                            <StyledFirebaseAuth
                                uiConfig={uiConfig}
                                firebaseAuth={firebase.auth()}
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    )
}
