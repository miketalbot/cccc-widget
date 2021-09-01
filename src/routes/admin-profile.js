import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
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

const storage = firebase.storage()

export default function Profile() {
    const user = useUserContext()
    const refresh = useRefresh()
    const [displayName, setDisplayName] = useState(user.displayName || "")
    const [photoURL, setPhotoURL] = useState(user.photoURL || "")
    const dirty =
        displayName !== (user.displayName || "") ||
        photoURL !== (user.photoURL || "")

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
