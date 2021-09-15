import { Box } from "@material-ui/core"
import { useEffect } from "react"
import Particles from "react-tsparticles"
import { raise } from "../lib/raise"
import { useMeasurement } from "../lib/useMeasurement"

const fire = {
    fullScreen: {
        enable: false
    },
    fpsLimit: 40,
    particles: {
        number: {
            value: 180,
            density: {
                enable: true,
                area: 800
            }
        },
        color: {
            value: ["#fdcf58", "#757676", "#f27d0c", "#800909", "#f07f13"]
        },
        opacity: {
            value: 0.5,
            random: true
        },
        size: {
            value: 3,
            random: true
        },
        move: {
            enable: true,
            speed: 6,
            random: false
        }
    },

    background: {
        image: "radial-gradient(#4a0000, #000)"
    }
}

export default function HTML({ article, settings }) {
    const [size, attach] = useMeasurement()
    useEffect(() => {
        article.overrideGradientFrom = "#000"
        article.overrideGradientTo = "#000"
        article.overrideBottomBackground = "#000"
        raise("refresh-widget")
        return () => {
            delete article.overrideBottomBackground
            delete article.overrideGradientFrom
            delete article.overrideGradientTo
            raise("refresh-widget")
        }
    }, [article])
    return (
        <Box flex={1} height={1} ref={attach} position="relative">
            <Particles options={fire} height={size.height} />
            <Box
                position="absolute"
                left={0}
                top={0}
                height={size.height}
                right={0}
                zIndex={100}
                p={3}
                pt={1}
                color="white"
                overflow="auto"
                alignItems="center"
                justifyContent="center"
                dangerouslySetInnerHTML={{ __html: settings.htmlContent }}
            />
        </Box>
    )
}
