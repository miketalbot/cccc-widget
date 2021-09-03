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
    IconButton,
    InputAdornment,
    InputLabel,
    makeStyles,
    TextField
} from "@material-ui/core"
import { useState } from "react"
import { setFromEvent } from "../lib/setFromEvent"
import { useUserContext } from "../lib/useUser"
import { Administration } from "./parts/Administration"
import { MdClear, MdLock } from "react-icons/all"
import { raise } from "../lib/raise"
import { ImageUploadButton } from "../lib/uploadButton"
import { MdFileUpload } from "react-icons/all"
import firebase from "firebase/app"
import { useRefresh } from "../lib/useRefresh"
import { useDialog } from "../lib/useDialog"
import { showNotification } from "../lib/notifications"
import { Interface } from "./parts/signin"
import { useEvent } from "../lib/useEvent"
import HTMLEditor from "../lib/HtmlEditor"
import NotchedOutline from "@material-ui/core/OutlinedInput/NotchedOutline"
import "./admin"

const storage = firebase.storage()

const useStyles = makeStyles({
    avatar: {
        width: 100,
        height: 100
    }
})

export default function Profile() {
    const classes = useStyles()
    const user = useUserContext()
    const refresh = useRefresh()
    const [description, setDescription] = useState(user.description || "")
    const [displayName, setDisplayName] = useState(user.displayName || "")
    const [photoURL, setPhotoURL] = useState(user.photoURL || "")
    const dirty =
        displayName !== (user.displayName || "") ||
        photoURL !== (user.photoURL || "") ||
        description !== (user.description || "")
    const changePassword = useDialog(ChangePassword)
    const signIn = useDialog(SignIn)
    return (
        <Administration>
            <Container>
                <Box width={1} clone>
                    <Card elevation={3}>
                        <CardHeader
                            title="Edit Your Profile"
                            action={
                                <IconButton
                                    aria-label="Close and go back icon"
                                    onClick={goBack}
                                >
                                    <MdClear />
                                </IconButton>
                            }
                        />
                        <CardContent>
                            <TextField
                                variant="outlined"
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
                                variant="outlined"
                                fullWidth
                                value={displayName}
                                onChange={setFromEvent(setDisplayName)}
                                label="Display Name"
                            />
                        </CardContent>
                        <CardContent>
                            <HTMLEditor
                                value={description}
                                onChange={setDescription}
                                label="Description"
                            />
                        </CardContent>
                        <CardContent>
                            <FormControl variant="outlined" fullWidth>
                                <Box borderRadius={4} width={1}>
                                    <NotchedOutline
                                        notched={true}
                                        labelWidth={50}
                                    />
                                </Box>
                                <InputLabel
                                    variant="outlined"
                                    shrink={true}
                                    htmlFor="avatar-input"
                                >
                                    Avatar
                                </InputLabel>
                                <Box display="flex" p={2} alignItems="center">
                                    <Box mr={2} flex={1}>
                                        <Avatar
                                            className={classes.avatar}
                                            src={photoURL}
                                        />
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
                            <Button
                                variant="outlined"
                                onClick={handlePassword}
                                color="primary"
                            >
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
    function goBack() {
        window.history.back(1)
    }
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
        try {
            await user.updateProfile({ displayName, photoURL })
            await user.saveAdditional({ description, displayName, photoURL })
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
