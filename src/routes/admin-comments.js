import { Administration } from "./parts/Administration"
import { db } from "../lib/firebase"
import { useUserContext } from "../lib/useUser"
import { useCollection } from "../lib/useCollection"
import { nanoid } from "nanoid"
import dayjs from "dayjs"
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
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    TextField
} from "@material-ui/core"
import { sortBy } from "../lib/sortBy"
import { setFromEvent } from "../lib/setFromEvent"
import { useState } from "react"
import { useDialog } from "../lib/useDialog"
import { showNotification } from "../lib/notifications"
import { FaComment } from "react-icons/fa"
import { MdClear, MdDelete } from "react-icons/md"
import { confirm } from "../lib/confirm"
import { VirtualWindow } from "virtual-window"
import { pick } from "../lib/pick"
import { navigate } from "../lib/routes"
import "./admin"

export const articles = db.collection("userarticles")

export default function Articles() {
    const user = useUserContext()
    const getName = useDialog(GetCommentName)
    const allComments = sortBy(
        useCollection(
            articles
                .doc(user.uid)
                .collection("articles")
                .where("comment", "==", true)
        ),
        (v) => -v.date
    )
    return (
        <Administration>
            <Container>
                <Box width={1} clone>
                    <Card elevation={3}>
                        <CardHeader
                            title="Your Comments"
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
                            <Box
                                maxHeight={"75vh"}
                                height={allComments.length * 80 + 8}
                                clone
                            >
                                <List>
                                    <VirtualWindow
                                        keyFn={pick("uid")}
                                        itemSize={80}
                                        list={allComments}
                                        item={<Comment />}
                                    />
                                </List>
                            </Box>
                        </CardContent>
                        <CardActions>
                            <Button onClick={addComment} color="primary">
                                + Comment
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
    async function addComment() {
        const name = await getName()
        if (name) {
            const comment = {
                uid: nanoid(),
                name,
                comment: true,
                date: Date.now()
            }
            try {
                await articles
                    .doc(user.uid)
                    .collection("articles")
                    .doc(comment.uid)
                    .set(comment)
                showNotification("Comment created")
            } catch (e) {
                showNotification(e.message, { severity: "error" })
            }
        }
    }
}

function GetCommentName({ ok, cancel }) {
    const [name, setName] = useState("")
    return (
        <>
            <DialogTitle>New Comment</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    value={name}
                    onChange={setFromEvent(setName)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel}>Cancel</Button>
                <Button
                    onClick={() => ok(name)}
                    color="secondary"
                    variant="contained"
                >
                    Create
                </Button>
            </DialogActions>
        </>
    )
}

function Comment({ item: { name, date, uid } }) {
    const user = useUserContext()
    return (
        <ListItem button onClick={() => navigate(`/admin/comment/${uid}`)}>
            <ListItemAvatar>
                <Avatar>
                    <FaComment />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={dayjs(date).format("D MMMM YYYY [ at ] HH:mm")}
            />
            <ListItemSecondaryAction>
                <IconButton
                    color="secondary"
                    onClick={remove}
                    aria-label="Delete"
                >
                    <MdDelete />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )

    async function remove() {
        try {
            if (
                !(await confirm(
                    `Are you sure you want to delete "${name}"?`,
                    "Delete Comment"
                ))
            )
                return
            await articles
                .doc(user.uid)
                .collection("articles")
                .doc(uid)
                .delete()
            showNotification(`${name} was deleted`)
        } catch (e) {
            showNotification(e.message, { severity: "error" })
        }
    }
}