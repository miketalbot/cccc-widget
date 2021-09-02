import { Administration } from "./Administration"
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
import { FaNewspaper } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { confirm } from "../lib/confirm"
import { VirtualWindow } from "virtual-window"
import { pick } from "../lib/pick"
import { navigate } from "../lib/routes"
import "./admin"

export const articles = db.collection("userarticles")

export default function Articles() {
    const user = useUserContext()
    const getName = useDialog(GetArticleName)
    const allArticles = sortBy(
        useCollection(articles.doc(user.uid).collection("articles")),
        (v) => -v.date
    )
    return (
        <Administration>
            <Container>
                <Box width={1} clone>
                    <Card elevation={3}>
                        <CardHeader title="Your Articles" />
                        <CardContent>
                            <Box
                                maxHeight={"75vh"}
                                height={allArticles.length * 80 + 8}
                                clone
                            >
                                <List>
                                    <VirtualWindow
                                        keyFn={pick("uid")}
                                        itemSize={80}
                                        list={allArticles}
                                        item={<Article />}
                                    />
                                </List>
                            </Box>
                        </CardContent>
                        <CardActions>
                            <Button onClick={addArticle} color="primary">
                                + Article
                            </Button>
                        </CardActions>
                    </Card>
                </Box>
            </Container>
        </Administration>
    )

    async function addArticle() {
        const name = await getName()
        if (name) {
            const article = {
                uid: nanoid(),
                name,
                date: Date.now()
            }
            try {
                await articles
                    .doc(user.uid)
                    .collection("articles")
                    .doc(article.uid)
                    .set(article)
                showNotification("Article created")
            } catch (e) {
                showNotification(e.message, { severity: "error" })
            }
        }
    }
}

function GetArticleName({ ok, cancel }) {
    const [name, setName] = useState("")
    return (
        <>
            <DialogTitle>New Article</DialogTitle>
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

function Article({ item: { name, date, uid } }) {
    const user = useUserContext()
    return (
        <ListItem button onClick={() => navigate(`/admin/article/${uid}`)}>
            <ListItemAvatar>
                <Avatar>
                    <FaNewspaper />
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
                    "Delete Article"
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
