import {
    Box,
    Button,
    Card,
    CardActionArea,
    CssBaseline,
    makeStyles,
    ThemeProvider,
    Typography
} from "@material-ui/core"
import { ResponsivePie } from "@nivo/pie"
import { useState } from "react"
import { respondUnique } from "../lib/firebase"
import { Loader } from "../lib/Loader"
import { showNotification } from "../lib/notifications"
import { reduceMotion } from "../lib/reduce-motion"
import { theme } from "../lib/theme"
import { useMeasurement } from "../lib/useMeasurement"
import { useResponse } from "../lib/useResponse"

export default function Runtime({
    settings,
    user,
    response,
    article,
    previewMode
}) {
    const [size, attach] = useMeasurement()
    const classes = useStyles(settings)
    const [showLoader, setShowLoader] = useState()
    const { responses: { Poll } = {} } = useResponse(response)
    const { [user.uid]: myResponse } = Poll || {}
    const counts = Poll
        ? Object.values(Poll).reduce((a, c) => {
              if (c) {
                  a[c] = (a[c] || 0) + 1
              }
              return a
          }, {})
        : {}
    const data = Object.entries(counts)
        .map(([key, value]) => {
            const answer = settings.answers.find((a) => a.id === key)
            return {
                id: answer?.legend || answer?.answer,
                label: answer?.answer,
                color: answer?.color,
                value
            }
        })
        .filter((a) => !!a.id)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {showLoader ? (
                <Loader caption={showLoader} />
            ) : (
                <Box
                    p={1}
                    width={1}
                    flexGrow={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="stretch"
                    justifyContent="stretch"
                >
                    {myResponse ? (
                        <>
                            <Box flex={1} display="flex" flexDirection="column">
                                <Box className={classes.title}>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="h1"
                                    >
                                        {settings.question}
                                    </Typography>
                                </Box>
                                <Box flex={1} ref={attach}>
                                    <Box height={size.height}>
                                        <ResponsivePie
                                            colors={{ datum: "data.color" }}
                                            data={data}
                                            animate={!reduceMotion()}
                                            margin={{
                                                top: 20,
                                                right: 120,
                                                bottom: 20,
                                                left: 120
                                            }}
                                            innerRadius={0.5}
                                            padAngle={0.7}
                                            cornerRadius={3}
                                            activeOuterRadiusOffset={8}
                                            borderWidth={1}
                                            borderColor={{
                                                from: "color",
                                                modifiers: [["darker", 0.2]]
                                            }}
                                            arcLinkLabelsSkipAngle={10}
                                            arcLinkLabelsTextColor={
                                                settings.questionColor
                                            }
                                            arcLinkLabelsThickness={2}
                                            arcLinkLabelsColor={{
                                                from: "color"
                                            }}
                                            arcLabelsSkipAngle={10}
                                            arcLabelsTextColor={{
                                                from: "color",
                                                modifiers: [["darker", 2]]
                                            }}
                                        />
                                    </Box>
                                </Box>
                                {previewMode && (
                                    <Button color="secondary" onClick={reset}>
                                        Reset
                                    </Button>
                                )}
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box className={classes.title}>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="h1"
                                >
                                    {settings.question}
                                </Typography>
                            </Box>
                            <Box className={classes.subtitle}>
                                <Typography variant="body1" gutterBottom>
                                    {settings.description}
                                </Typography>
                            </Box>
                            <Box
                                display="flex"
                                flexWrap="wrap"
                                alignItems="stretch"
                                justifyContent="stretch"
                                mt={2}
                            >
                                {settings.answers.map((answer) => (
                                    <AnswerCard
                                        article={article}
                                        loader={setShowLoader}
                                        key={answer.id}
                                        answer={answer}
                                    />
                                ))}
                            </Box>
                        </>
                    )}
                </Box>
            )}
        </ThemeProvider>
    )

    async function reset() {
        setShowLoader("Resetting")
        await respondUnique(article.uid, "Poll", null)
        setShowLoader(false)
    }
}

const useStyles = makeStyles({
    card: {
        borderLeftColor: (props) => props.color,
        borderLeftWidth: 10,
        borderLeftStyle: "solid",
        borderRightColor: (props) => props.color,
        borderRightWidth: 0,
        borderRightStyle: "solid"
    },
    title: {
        color: (props) => props.questionColor
    },
    subtitle: {
        color: (props) => props.questionColor,
        opacity: 0.85
    }
})

function AnswerCard({ answer, loader, article }) {
    const classes = useStyles({ color: answer.color })
    return (
        <Box flexGrow={1} m={1} width={1 / 2.2} onClick={click} lineHeight={1}>
            <Box height={1} clone>
                <Card elevation={5} className={classes.card}>
                    <Box height={1} clone>
                        <CardActionArea>
                            <Box p={1}>
                                <Typography variant="body2">
                                    {answer.answer}
                                </Typography>
                            </Box>
                        </CardActionArea>
                    </Box>
                </Card>
            </Box>
        </Box>
    )

    async function click() {
        loader("Registering your choice")
        try {
            await respondUnique(article.uid, "Poll", answer.id)
        } catch (e) {
            showNotification(e.message, { severity: "error" })
        } finally {
            loader(false)
        }
    }
}
