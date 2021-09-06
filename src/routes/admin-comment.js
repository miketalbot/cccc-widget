import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    IconButton,
    Tab
} from "@material-ui/core"
import { useRef, useState } from "react"
import { showNotification } from "../lib/notifications"
import { useRecord } from "../lib/useRecord"
import { useUserContext } from "../lib/useUser"
import { articles } from "./admin-articles"
import { Administration } from "./parts/Administration"
import "./admin"
import { useRefresh } from "../lib/useRefresh"
import { useEvent } from "../lib/useEvent"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { PluginTypes } from "../lib/plugins"
import { PluginDetails } from "./parts/PluginDetails"
import { AdvancedArticleSettings } from "./parts/AdvancedArticleSettings"
import { useEditorPlugins } from "../lib/usePlugins"
import { MdClear } from "react-icons/md"
import { CommentDetails } from "./parts/CommentDetails"
import { Bound } from "../lib/Bound"
import { ColorEditor } from "./parts/ColorEditor"

export default function Comment({ id }) {
    const user = useUserContext()
    const [tab, setTab] = useState("0")
    const refresh = useRefresh()
    const changeRefresh = useRefresh(change)
    const updated = useRef(false)
    const [article, update] = useRecord(
        articles.doc(user.uid).collection("articles").doc(id)
    )
    if (article) {
        article.author = user.uid
    }
    const shouldUpdate = useRef(false)
    const [plugins, setPlugins] = useState(0)
    useEditorPlugins(article?.additionalPlugins, [plugins])
    useEvent("can-navigate", (_, info) => {
        if (updated.current) {
            info.message =
                info.message || "Are you sure you want to lose your changes?"
        }
    })
    return (
        <Administration>
            {!!article && (
                <Bound
                    target={article}
                    refresh={changeRefresh}
                    onChange={change}
                >
                    <Container>
                        <Box mt={2} width={1} clone>
                            <Card elevation={3}>
                                <CardHeader
                                    action={
                                        <IconButton
                                            aria-label="Close and go back icon"
                                            onClick={goBack}
                                        >
                                            <MdClear />
                                        </IconButton>
                                    }
                                    title={article.name}
                                />
                                <CardContent>
                                    <TabContext value={tab}>
                                        <TabList
                                            aria-label="Article configuration tabs"
                                            onChange={(_, tab) => setTab(tab)}
                                        >
                                            <Tab label="Details" value="0" />
                                            <Tab label="Colors" value="4" />
                                            <Tab
                                                label="Main Widget"
                                                value="1"
                                            />
                                            <Tab
                                                label="Footer Widget"
                                                value="2"
                                            />
                                            <Tab label="Advanced" value="3" />
                                        </TabList>
                                        <TabPanel value="0">
                                            <CommentDetails
                                                article={article}
                                                onChange={change}
                                            />
                                        </TabPanel>
                                        <TabPanel value="4">
                                            <ColorEditor />
                                        </TabPanel>
                                        <TabPanel value="1">
                                            <PluginDetails
                                                article={article}
                                                onChange={change}
                                                type={PluginTypes.MAIN}
                                            />
                                        </TabPanel>
                                        <TabPanel value="2">
                                            <PluginDetails
                                                article={article}
                                                onChange={change}
                                                type={PluginTypes.FOOTER}
                                            />
                                        </TabPanel>
                                        <TabPanel value="3">
                                            <AdvancedArticleSettings
                                                article={article}
                                                onChange={() => {
                                                    change()
                                                    shouldUpdate.current = true
                                                }}
                                                reload={() => {
                                                    if (!shouldUpdate.current)
                                                        return
                                                    setPlugins((v) => v + 1)
                                                    shouldUpdate.current = false
                                                }}
                                            />
                                        </TabPanel>
                                    </TabContext>
                                </CardContent>
                                <CardActions>
                                    <Box flex={1} />

                                    <Button
                                        onClick={refresh(
                                            () =>
                                                update() &&
                                                showNotification(
                                                    "Comment saved"
                                                ) &&
                                                (updated.current = false)
                                        )}
                                        color="secondary"
                                        variant="contained"
                                        disabled={!updated.current}
                                    >
                                        Save
                                    </Button>
                                </CardActions>
                            </Card>
                        </Box>
                    </Container>
                </Bound>
            )}
        </Administration>
    )

    function goBack() {
        window.history.back(1)
    }

    function change() {
        if (!updated.current) {
            updated.current = true
            refresh()
        }
    }
}
