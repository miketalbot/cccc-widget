import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Tab,
    Tabs
} from "@material-ui/core"
import { useRef, useState } from "react"
import { showNotification } from "../lib/notifications"
import { Case, If, Switch } from "../lib/switch"
import { useRecord } from "../lib/useRecord"
import { useUserContext } from "../lib/useUser"
import { articles } from "./admin-articles"
import { Administration } from "./Administration"
import { ArticleDetails } from "./ArticleDetails"
import "./admin"
import { useRefresh } from "../lib/useRefresh"
import { useEvent } from "../lib/useEvent"

export default function Article({ id }) {
    const user = useUserContext()
    const [tab, setTab] = useState(0)
    const refresh = useRefresh()
    const updated = useRef(false)
    const [article, update] = useRecord(
        articles.doc(user.uid).collection("articles").doc(id)
    )
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
                                <Tabs
                                    value={tab}
                                    onChange={(_, tab) => setTab(tab)}
                                >
                                    <Tab label="Article Details" />
                                    <Tab label="Main Widget" />
                                    <Tab label="Footer Widget" />
                                </Tabs>
                            </CardContent>
                            <Switch value={tab}>
                                <Case when={0}>
                                    <ArticleDetails
                                        article={article}
                                        onChange={() =>
                                            !updated.current &&
                                            (updated.current = true) &&
                                            refresh()
                                        }
                                    />
                                </Case>
                            </Switch>
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
}

export function getTag(document, tag) {
    const element = document.head.querySelector(`meta[property="${tag}"]`)
    if (element) {
        return element.content
    }
    return null
}
