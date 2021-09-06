import { Avatar, Box, Typography, makeStyles } from "@material-ui/core"
import { useEffect } from "react"
import Particles from "react-tsparticles"
import { raise } from "../lib/raise"
import { useMeasurement } from "../lib/useMeasurement"
import logo from "../assets/4C_logo.jpg"

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

const useStyles = makeStyles({
    logo: {
        width: 150,
        height: 150,
        marginTop: 16,
        marginBottom: 32,
        boxShadow: "0 0 12px 0 #fca31f"
    },
    link: {
        color: "#eee",
        textDecoration: "none",
        fontWeight: "200",
        fontSize: "80%",
        "&:hover": {
            textDecoration: "underline"
        }
    }
})

export default function CCCC({ article }) {
    const classes = useStyles()
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
                top={20}
                bottom={0}
                textAlign="center"
                right={0}
                zIndex={100}
                p={3}
                color="white"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Avatar className={classes.logo} src={logo} />
                <Typography variant="caption" gutterBottom>
                    The <b>C</b>ool <b>C</b>ommunity for <b>C</b>ontent <b>C</b>
                    reators
                </Typography>
                <a
                    rel="noreferrer"
                    target="_blank"
                    className={classes.link}
                    href="https://4c.rocks"
                >
                    About 4C...
                </a>
            </Box>
        </Box>
    )
}
