import { Box } from "@material-ui/core"
import { Suspense, useEffect, useState } from "react"
import reactDom from "react-dom"
import { FaCircle } from "react-icons/fa"
import { GiTwoCoins } from "react-icons/gi"
import { recommend } from "../lib/firebase"
import { ListItemBox } from "../lib/ListItemBox"
import { Odometer } from "../lib/odometer"
import { PluginTypes, register } from "../lib/plugins"

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
            setRecommendations(await recommend(article.uid))
        })
    }, [article])
    console.log(recommendations)
    return (
        <Box color="#222" fontWeight="bold" mr={1.5} mt={2}>
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
        </Box>
    )
}
