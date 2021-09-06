import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    makeStyles,
    Typography
} from "@material-ui/core"
import {
    createContext,
    Suspense,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react"
import reactDom from "react-dom"
import { FaCircle } from "react-icons/fa"
import { GiTwoCoins } from "react-icons/gi"
import { wasClicked, wasRecommended } from "../lib/firebase"
import { db, recommend } from "../lib/firebase"
import { ListItemBox } from "../lib/ListItemBox"
import { Odometer } from "../lib/odometer"
import { PluginTypes, register } from "../lib/plugins"
import { useRecordStatic } from "../lib/useRecord"

register(PluginTypes.NOTIFICATION, "defaultNotification", undefined, runtime)

function runtime({ parent, ...props }) {
    reactDom.render(
        <Suspense fallback={<div />}>
            <Notifications {...props} />
        </Suspense>,
        parent
    )
}

const InteractionContext = createContext()

const useStyles = makeStyles({
    score: {
        position: "absolute",
        zIndex: 100,
        width: "calc(100% + 8px)",
        left: 0,
        top: 6,
        padding: 4,
        background: "#fffc",
        boxShadow: "0 0 3px 0 white",
        borderRadius: 8,
        backdropFilter: "blur(3px)"
    }
})

function Notifications({ user, article }) {
    const observer = useMemo(() => {
        let observer = new IntersectionObserver(seen(new Set()), {
            threshold: 0.75
        })
        return observer
    }, [])
    useEffect(() => {
        return () => {
            observer.disconnect()
        }
    }, [observer])
    const [recommendations, setRecommendations] = useState([])
    useEffect(() => {
        setTimeout(async () => {
            setRecommendations(await recommend(article.uid, 5))
        })
    }, [article])
    const classes = useStyles()
    return (
        <InteractionContext.Provider value={observer}>
            <Box
                color="#222"
                flex={1}
                height={1}
                display="flex"
                position="relative"
                flexDirection="column"
                fontWeight="bold"
                mr={1.5}
            >
                <ListItemBox
                    className={classes.score}
                    justifyContent="space-between"
                >
                    <ListItemBox whiteSpace="nowrap">
                        <Box mr={1} lineHeight={0} fontSize="150%">
                            <GiTwoCoins />
                        </Box>
                        <Box mr={3} aria-label="Score">
                            <Odometer>{user?.score}</Odometer>
                        </Box>
                    </ListItemBox>

                    <ListItemBox whiteSpace="nowrap" flex={0} mr={1}>
                        <Box mr={1} lineHeight={0} fontSize="100%">
                            <FaCircle />
                        </Box>
                        <Box aria-label="Achievements">
                            <Odometer>
                                {Object.keys(user?.achievements ?? {}).length}
                            </Odometer>
                        </Box>
                    </ListItemBox>
                </ListItemBox>
                <Box
                    pl={1}
                    pt={7}
                    flex={1}
                    overflow="auto"
                    style={{ zoom: 0.75 }}
                >
                    {recommendations.map((recommendation) => (
                        <Article key={recommendation} id={recommendation} />
                    ))}
                </Box>
            </Box>
        </InteractionContext.Provider>
    )
}

function seen(seenItems) {
    return (entries) => {
        entries.forEach(({ target }) => {
            if (seenItems.has(target.articleId)) return
            wasRecommended(target.articleId).catch(console.error)
            seenItems.add(target.articleId)
        })
    }
}

function Article({ id }) {
    const record = useRecordStatic(db.collection("articles").doc(id), [id])
    const observer = useContext(InteractionContext)
    return (
        !!record && (
            <Box mb={1} clone>
                <Card ref={attachObserver}>
                    <CardActionArea onClick={goto}>
                        {record.image && (
                            <CardMedia
                                image={record.image}
                                style={{ height: 120 }}
                            />
                        )}
                        <CardContent>
                            <Typography variant="body1" gutterBottom>
                                {record.title}
                            </Typography>
                            <Box
                                fontWeight={300}
                                color="textSecondary"
                                dangerouslySetInnerHTML={{
                                    __html: record.description
                                }}
                            />
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>
        )
    )
    function attachObserver(target) {
        if (target) {
            target.articleId = id
            observer.observe(target)
        }
    }

    function goto() {
        wasClicked(id).catch(console.error)
        window.open(record.url, "_blank")
    }
}
