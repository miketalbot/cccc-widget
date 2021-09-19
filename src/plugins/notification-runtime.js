import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    makeStyles,
    Tooltip,
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

import { acknowledge, addAchievement, wasClicked } from "../lib/firebase"
import { db, recommend } from "../lib/firebase"
import { ListItemBox } from "../lib/ListItemBox"
import { showNotification } from "../lib/notifications"
import { Odometer } from "../lib/odometer"
import { PluginTypes, register } from "../lib/plugins"
import { sortBy } from "../lib/sortBy"
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
    },
    achievement: {
        textTransform: "capitalize"
    }
})

let acknowledged
let displayed = new Set()

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

    useEffect(() => {
        if (!user.achievements || !Object.keys(user.achievements).length) return

        acknowledged = Math.max(
            user?.acknowledged || Date.now() - 100000,
            acknowledged || 0
        )
        const activeAchievements = Object.entries(user.achievements)
            .filter(([achievement, time]) => {
                if (displayed.has(achievement)) return false
                displayed.add(achievement)
                return Date.now() - time < 1000 * 60 * 5 && time > acknowledged
            })
            .map(([achievement, time]) => ({ achievement, time }))
            .sort((a, b) => a.time - b.time)

        let time = 0
        if (activeAchievements.length) {
            acknowledge(Date.now())
            acknowledged = Date.now()
        }
        if (user?.score < 152) return
        for (let { achievement } of activeAchievements) {
            setTimeout(() => {
                showNotification(
                    <Box
                        key={achievement}
                        display="flex"
                        alignItems="center"
                        mb={0.5}
                    >
                        <Box
                            className={classes.achievement}
                            display="flex"
                            alignItems="center"
                        >
                            <Box mr={1} fontSize="145%" lineHeight={0}>
                                <FaCircle color="gold" />
                            </Box>
                            <Box>{achievement}</Box>
                        </Box>
                    </Box>,
                    { severity: "success", title: "Earned Badge" }
                )
            }, time)
            time += 8000
        }

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(user?.achievements)])
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
                    <Tooltip
                        arrow
                        title="Your score, based on how much you interact with 4C content"
                    >
                        <ListItemBox flex={0} whiteSpace="nowrap">
                            <Box mr={1} lineHeight={0} fontSize="150%">
                                <GiTwoCoins />
                            </Box>
                            <Box mr={3} aria-label="Score">
                                <Odometer>{user?.score}</Odometer>
                            </Box>
                        </ListItemBox>
                    </Tooltip>
                    <Box flex={10} />
                    <Tooltip title={<Badges user={user} />} interactive arrow>
                        <ListItemBox flex={0} whiteSpace="nowrap" mr={1}>
                            <Box mr={1} lineHeight={0} fontSize="100%">
                                <FaCircle />
                            </Box>
                            <Box aria-label="Achievements">
                                <Odometer>
                                    {
                                        Object.keys(user?.achievements ?? {})
                                            .length
                                    }
                                </Odometer>
                            </Box>
                        </ListItemBox>
                    </Tooltip>
                </ListItemBox>
                <Box
                    pl={1}
                    pt={7}
                    flex={1}
                    overflow="auto"
                    style={{ zoom: 0.75 }}
                >
                    <Box
                        borderRadius={48}
                        bgcolor="#000d"
                        boxShadow="0 0 2px 0 #000d"
                        color="white"
                        fontWeight={400}
                        mb={1}
                        p={0.5}
                        textAlign="center"
                    >
                        Great content from 4C authors
                    </Box>
                    {recommendations.map((recommendation) => (
                        <Article key={recommendation} id={recommendation} />
                    ))}
                </Box>
            </Box>
        </InteractionContext.Provider>
    )
}

function Badges({ user }) {
    const classes = useStyles()
    return (
        <Box>
            <Box mb={1}>The achievements you have unlocked:</Box>
            <Box maxHeight={150} overflow="auto">
                {sortBy(
                    Object.entries(user?.achievements || {}),
                    (v) => -v[1]
                ).map(([achievement]) => {
                    return (
                        <Box
                            key={achievement}
                            display="flex"
                            alignItems="center"
                            mb={0.5}
                        >
                            <Box mr={1}>
                                <FaCircle color="gold" />
                            </Box>
                            <Box className={classes.achievement}>
                                {achievement}
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

function seen(seenItems) {
    return (entries) => {
        entries.forEach(({ target }) => {
            if (seenItems.has(target.articleId)) return
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
                            <Typography variant="body2" gutterBottom>
                                {record.title}
                            </Typography>
                            <Box
                                fontWeight={300}
                                color="#777"
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
        addAchievement(50, "Clicked on an article link").catch(console.error)
        wasClicked(id).catch(console.error)
        window.open(record.url, "_blank")
    }
}
