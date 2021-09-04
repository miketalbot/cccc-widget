import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@material-ui/core"
import { Suspense, useEffect, useState } from "react"
import reactDom from "react-dom"
import { FaCircle } from "react-icons/fa"
import { GiTwoCoins } from "react-icons/gi"
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

function Notifications({ user, article }) {
    const [recommendations, setRecommendations] = useState([])
    useEffect(() => {
        setTimeout(async () => {
            setRecommendations(await recommend(article.uid, 5))
        })
    }, [article])
    console.log(recommendations)
    return (
        <Box
            color="#222"
            flex={1}
            height={1}
            display="flex"
            flexDirection="column"
            fontWeight="bold"
            pr={1.5}
            pt={2}
        >
            <ListItemBox
                p={1}
                width={1}
                bgcolor="#fff9"
                borderRadius={8}
                boxShadow="0 0 12px 0 white"
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
            <Box mt={2} flex={1} overflow="auto" style={{ zoom: 0.75 }}>
                {recommendations.map((recommendation) => (
                    <Article key={recommendation} id={recommendation} />
                ))}
            </Box>
        </Box>
    )
}

function Article({ id }) {
    const record = useRecordStatic(db.collection("articles").doc(id), [id])
    console.log(id, record)
    return (
        !!record && (
            <Box mb={1} clone>
                <Card>
                    <CardActionArea>
                        <CardMedia
                            image={record.image}
                            style={{ height: 120 }}
                        />
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
}
