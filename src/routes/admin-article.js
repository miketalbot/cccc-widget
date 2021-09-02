import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Tab
} from "@material-ui/core"
import { useRef, useState } from "react"
import { showNotification } from "../lib/notifications"
import { useRecord } from "../lib/useRecord"
import { useUserContext } from "../lib/useUser"
import { articles } from "./admin-articles"
import { Administration } from "./Administration"
import { ArticleDetails } from "./ArticleDetails"
import "./admin"
import { useRefresh } from "../lib/useRefresh"
import { useEvent } from "../lib/useEvent"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { PluginTypes } from "../lib/plugins"
import { PluginDetails } from "./PluginDetails"
import { AdvancedArticleSettings } from "./AdvancedArticleSettings"
import { useEditorPlugins } from "../lib/usePlugins"

export default function Article({ id }) {
    const user = useUserContext()
    const [tab, setTab] = useState("0")
    const refresh = useRefresh()
    const updated = useRef(false)
    const [article, update] = useRecord(
        articles.doc(user.uid).collection("articles").doc(id)
    )
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
                <Container>
                    <Box mt={2} width={1} clone>
                        <Card elevation={3}>
                            <CardHeader title={article.name} />
                            <CardContent>
                                <TabContext value={tab}>
                                    <TabList
                                        aria-label="Article configuration tabs"
                                        onChange={(_, tab) => setTab(tab)}
                                    >
                                        <Tab
                                            label="Article Details"
                                            value="0"
                                        />
                                        <Tab label="Main Widget" value="1" />
                                        <Tab label="Footer Widget" value="2" />
                                        <Tab
                                            label="Advanced Settings"
                                            value="3"
                                        />
                                    </TabList>
                                    <TabPanel value="0">
                                        <ArticleDetails
                                            article={article}
                                            onChange={change}
                                        />
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
                                            showNotification("Article saved") &&
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
            )}
        </Administration>
    )

    function change() {
        if (!updated.current) {
            updated.current = true
            refresh()
        }
    }
}
