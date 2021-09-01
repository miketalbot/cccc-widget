import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputAdornment,
    InputLabel,
    TextField
} from "@material-ui/core"
import { useState } from "react"
import { setFromEvent } from "../lib/setFromEvent"
import { useUserContext } from "../lib/useUser"
import { Administration } from "./Administration"
import { MdLock } from "@react-icons/all-files/md/MdLock"
import { raise } from "../lib/raise"
import { ImageUploadButton } from "../lib/uploadButton"
import { MdFileUpload } from "@react-icons/all-files/md/MdFileUpload"
import firebase from "firebase/app"
import { useRefresh } from "../lib/useRefresh"
import { useDialog } from "../lib/useDialog"
import { showNotification } from "../lib/notifications"
import { Interface } from "./parts/signin"
import { useEvent } from "../lib/useEvent"

const storage = firebase.storage()

export default function Profile() {
    const user = useUserContext()
    const refresh = useRefresh()
    const [displayName, setDisplayName] = useState(user.displayName || "")
    const [photoURL, setPhotoURL] = useState(user.photoURL || "")
    const dirty =
        displayName !== (user.displayName || "") ||
        photoURL !== (user.photoURL || "")
    const changePassword = useDialog(ChangePassword)
    const signIn = useDialog(SignIn)
    return (
        <Administration>
            <Container>
                <Box width={1} clone>
                    <Card elevation={3}>
                        <CardHeader component="h2" title="Edit Your Profile" />
                        <CardContent>
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdLock />
                                        </InputAdornment>
                                    )
                                }}
                                fullWidth
                                value={user.email ?? ""}
                                label="Email Address"
                                readOnly
                            />
                        </CardContent>
                        <CardContent>
                            <TextField
                                fullWidth
                                value={displayName}
                                onChange={setFromEvent(setDisplayName)}
                                label="Display Name"
                            />
                        </CardContent>
                        <CardContent>
                            <FormControl>
                                <InputLabel
                                    shrink={true}
                                    htmlFor="avatar-input"
                                >
                                    Avatar
                                </InputLabel>
                                <Box display="flex" mt={3} alignItems="center">
                                    <Box mr={2}>
                                        <Avatar src={photoURL} />
                                    </Box>
                                    <Box>
                                        <ImageUploadButton
                                            maxWidth={500}
                                            maxHeight={500}
                                            onRaw={upload}
                                            id="avatar-input"
                                            color="secondary"
                                        >
                                            <MdFileUpload />
                                        </ImageUploadButton>
                                    </Box>
                                </Box>
                            </FormControl>
                        </CardContent>
                        <CardActions>
                            <Button onClick={handlePassword} color="primary">
                                Change Password
                            </Button>
                            <Box flex={1} />

                            <Button
                                onClick={save}
                                disabled={!dirty}
                                color="secondary"
                                variant="contained"
                            >
                                Save
                            </Button>
                        </CardActions>
                    </Card>
                </Box>
            </Container>
        </Administration>
    )

    async function handlePassword() {
        const newPassword = await changePassword()
        if (newPassword) {
            try {
                console.log(newPassword)
                await user.updatePassword(newPassword)
                showNotification("Password Changed")
            } catch (e) {
                showNotification(e.message, { severity: "error" })
                if (e.code === "auth/requires-recent-login") {
                    await signIn()
                    showNotification("Go ahead and change your password")
                }
                console.log(JSON.stringify(e))
                // showNotification("You must sign in again", {
                //     severity: "warning"
                // })
                // await signIn()
            }
        }
    }

    async function upload(data) {
        const ref = storage.ref("profilepics").child(`${user.uid}`)
        await ref.put(data)
        setPhotoURL(await ref.getDownloadURL())
        refresh()
    }

    async function save() {
        console.log(photoURL)
        try {
            await user.updateProfile({ displayName, photoURL })
        } catch (e) {
            console.log(e)
        }
        raise("user-updated")
    }
}

function SignIn({ cancel }) {
    useEvent("signed-in", cancel)
    return (
        <>
            <DialogTitle>Sign In</DialogTitle>
            <DialogContent>
                <Interface />
            </DialogContent>
        </>
    )
}

function ChangePassword({ ok, cancel }) {
    const [password, setPassword] = useState("")
    return (
        <>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    value={password}
                    onChange={setFromEvent(setPassword)}
                    label="New Password"
                    InputProps={{ type: "password" }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => ok(password)}
                    color="primary"
                    variant="contained"
                >
                    Change
                </Button>
                <Button onClick={cancel} color="secondary">
                    Cancel
                </Button>
            </DialogActions>
        </>
    )
}
