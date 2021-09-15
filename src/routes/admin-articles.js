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
    makeStyles,
    TextField
} from "@material-ui/core"
import { sortBy } from "../lib/sortBy"
import { setFromEvent } from "../lib/setFromEvent"
import { useState } from "react"
import { useDialog } from "../lib/useDialog"
import { showNotification } from "../lib/notifications"
import { FaNewspaper } from "react-icons/fa"
import { MdClear, MdDelete, MdPerson } from "react-icons/md"
import { confirm } from "../lib/confirm"
import { VirtualWindow } from "virtual-window"
import { pick } from "../lib/pick"
import { navigate } from "../lib/routes"
import "./admin"
import { useCountsFor } from "../lib/useResponse"
import { IoMdEye } from "react-icons/io"
import { Odometer } from "../lib/odometer"
import { PluginTypes } from "../lib/plugins"
import { GiClick } from "react-icons/gi"
import { AiOutlineInteraction } from "react-icons/ai"

export const articles = db.collection("userarticles")

export default function Articles() {
    const user = useUserContext()
    const getName = useDialog(GetArticleName)
    const allArticles = sortBy(
        useCollection(
            articles
                .doc(user.uid)
                .collection("articles")
                .where("comment", "!=", true)
        ),
        (v) => -v.date
    )
    return (
        <Administration>
            <Container>
                <Box width={1} clone>
                    <Card elevation={3}>
                        <CardHeader
                            title="Your Articles"
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
                                maxHeight={"68vh"}
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
    function goBack() {
        window.history.back(1)
    }
    async function addArticle() {
        const name = await getName()
        if (name) {
            const article = {
                uid: nanoid(),
                name,
                enabled: true,
                [PluginTypes.MAIN]: "4C",
                [PluginTypes.FOOTER]: "Footer Profile",
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

const useStyles = makeStyles({
    result: {
        borderRadius: 8,
        background: "#eee",
        display: "flex",
        alignItems: "center",
        padding: 4,
        marginRight: 8,
        color: "#222"
    }
})

function Article({ item: { name, date, uid, image } }) {
    const classes = useStyles()
    const user = useUserContext()
    const counts = useCountsFor(uid)
    return (
        <ListItem button onClick={() => navigate(`/admin/article/${uid}`)}>
            <ListItemAvatar>
                <Avatar src={image}>
                    <FaNewspaper />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={dayjs(date).format("D MMMM YYYY [ at ] HH:mm")}
            />
            <ListItemSecondaryAction>
                <Box
                    color="#555"
                    display="flex"
                    alignItems="center"
                    lineHeight={0}
                >
                    {!!counts && (
                        <Box display="flex" flexWrap="wrap" alignItems="center">
                            {!!counts.responseCount && (
                                <Box className={classes.result}>
                                    <Box mr={1}>
                                        <AiOutlineInteraction />
                                    </Box>
                                    <Box
                                        aria-label="Number of interactions"
                                        minWidth={50}
                                        textAlign="right"
                                    >
                                        <Odometer>
                                            {counts.responseCount || 0}
                                        </Odometer>
                                    </Box>
                                </Box>
                            )}
                            {!!counts.clicks && (
                                <Box className={classes.result}>
                                    <Box mr={1}>
                                        <GiClick />
                                    </Box>
                                    <Box
                                        aria-label="Clicks on recommendations"
                                        minWidth={45}
                                        textAlign="right"
                                    >
                                        <Odometer>
                                            {counts.clicks || 0}
                                        </Odometer>
                                    </Box>
                                </Box>
                            )}
                            <Box className={classes.result}>
                                <Box mr={1}>
                                    <IoMdEye />
                                </Box>
                                <Box
                                    aria-label="Number of views"
                                    minWidth={50}
                                    textAlign="right"
                                >
                                    <Odometer>{counts.visits || 0}</Odometer>
                                </Box>
                            </Box>
                            <Box className={classes.result}>
                                <Box mr={1}>
                                    <MdPerson />
                                </Box>
                                <Box
                                    aria-label="Unique views"
                                    minWidth={45}
                                    textAlign="right"
                                >
                                    <Odometer>
                                        {counts.uniqueVisits || 0}
                                    </Odometer>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    <IconButton
                        color="secondary"
                        onClick={remove}
                        aria-label="Delete"
                    >
                        <MdDelete />
                    </IconButton>
                </Box>
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
