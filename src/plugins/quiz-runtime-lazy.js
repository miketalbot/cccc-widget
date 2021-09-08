import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CssBaseline,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    ThemeProvider
} from "@material-ui/core"
import { useResponse } from "../lib/useResponse"
import { useRefresh } from "../lib/useRefresh"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { addAchievement, awardPoints, respondUnique } from "../lib/firebase"
import { Bound, useBoundContext } from "../lib/Bound"
import { ListItemBox } from "../lib/ListItemBox"
import { theme } from "../lib/theme"
import { MdCheck, MdClear } from "react-icons/md"
import { useDialog } from "../lib/useDialog"
import { delay } from "../lib/delay"

export default function Quiz({ article, settings, user, response }) {
    const userResponse = useResponse(response)
    const [firstResponse] = useState({})
    const currentResponse = useRef()
    const { myResponse, allResponses } = useMemo(() => {
        const allResponses = userResponse?.responses?.Quiz
        return {
            allResponses,
            myResponse:
                currentResponse.current ??
                allResponses?.[user.uid] ??
                firstResponse
        }
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userResponse, user.uid, firstResponse, currentResponse.current])
    const onChange = useCallback(async () => {
        await respondUnique(article.uid, "Quiz", myResponse)
    }, [myResponse, article])
    const refresh = useRefresh(() => {
        currentResponse.current = { ...myResponse }
        onChange()
    })
    const state = (myResponse.state =
        myResponse.state ||
        (settings.introduction?.length > 10 ? "intro" : "question"))
    const question = (myResponse.question = myResponse.question || 0)

    myResponse.score = myResponse.score || 0
    myResponse.answers = myResponse.answers || {}
    return (
        (question !== 0 || settings.questions?.length > 0) &&
        !userResponse.notLoaded && (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Bound
                    user={user}
                    allResponses={allResponses}
                    target={myResponse}
                    refresh={refresh}
                    onChange={onChange}
                    settings={settings}
                >
                    <Box
                        color={settings.questionColor}
                        flex={1}
                        height={1}
                        position="relative"
                        overflow="auto"
                    >
                        {state === "intro" && <QuizIntro />}
                        {state === "question" && (
                            <QuizQuestion question={question} />
                        )}
                        {state === "results" && (
                            <QuizResults question={question} />
                        )}
                        {state === "done" && <QuizEnd />}
                    </Box>
                </Bound>
            </ThemeProvider>
        )
    )
}

function QuizIntro() {
    const { settings, refresh, target } = useBoundContext()
    return (
        <>
            <Box
                pl={2}
                pr={2}
                fontSize="150%"
                dangerouslySetInnerHTML={{ __html: settings.introduction }}
                mb={2}
                minHeight={200}
            />
            <ListItemBox justifyContent="center">
                <Button
                    onClick={refresh(() => (target.state = "question"))}
                    variant="contained"
                    color="primary"
                >
                    Start
                </Button>
            </ListItemBox>
        </>
    )
}

const useQuestionStyles = makeStyles({
    question: {
        lineHeight: 1.1,
        "& pre": {
            fontSize: 13,
            lineHeight: 1
        }
    }
})

function QuizQuestion({ question }) {
    const classes = useQuestionStyles()
    const { settings } = useBoundContext()
    const definition = settings.questions[question]
    return (
        <>
            <Box
                pl={2}
                pr={2}
                className={classes.question}
                fontSize="120%"
                dangerouslySetInnerHTML={{
                    __html: definition.question
                }}
                mb={3}
                minHeight={40}
            />
            <Box
                display="flex"
                flexWrap="wrap"
                alignItems="stretch"
                justifyContent="stretch"
            >
                {(definition.answers ?? []).map((answer) => (
                    <AnswerCard
                        definition={definition}
                        key={answer.id}
                        answer={answer}
                    />
                ))}
            </Box>
        </>
    )
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
    },
    paper: {
        background: "#444",
        color: "#fff",
        borderRadius: "100%"
    }
})

function AnswerCard({ answer, definition }) {
    const classes = useStyles({ color: answer.color })
    const { target, refresh } = useBoundContext()
    const correct = useDialog(Correct, {
        classes: { paper: classes.paper },
        minWidth: "xs",
        fullWidth: false
    })
    const wrong = useDialog(Wrong, {
        classes: { paper: classes.paper },
        fullWidth: false
    })
    return (
        <Box flexGrow={1} m={1} width={1 / 2.2} onClick={click} lineHeight={1}>
            <Box height={1} clone>
                <Card elevation={5} className={classes.card}>
                    <Box height={1} clone>
                        <CardActionArea>
                            <Box
                                p={1}
                                dangerouslySetInnerHTML={{
                                    __html: answer.answer
                                }}
                            />
                        </CardActionArea>
                    </Box>
                </Card>
            </Box>
        </Box>
    )

    async function click() {
        if (definition.answers.some((c) => c.correct)) {
            if (answer.correct) {
                addAchievement(50, `Got a quiz answer correct`).catch(
                    console.error
                )
                target.score = target.score + 1
                await correct()
                await delay(500)
            } else {
                await wrong()
                await delay(500)
            }
        }
        target.state = "results"
        target.answers[definition.id] = answer.id
        refresh()
    }
}

function Correct({ ok }) {
    useEffect(() => {
        setTimeout(ok, 2000)
    }, [ok])
    return (
        <Box
            borderRadius={"100%"}
            bgcolor="#222"
            color="green"
            p={3}
            fontSize="150%"
            textAlign="center"
        >
            <Box mb={1}>
                <MdCheck />
            </Box>
            Correct!
        </Box>
    )
}

function Wrong({ ok }) {
    useEffect(() => {
        setTimeout(ok, 2000)
    }, [ok])
    return (
        <Box
            borderRadius={8}
            color="red"
            p={3}
            fontSize="150%"
            textAlign="center"
        >
            <Box mb={1}>
                <MdClear />
            </Box>
            Wrong!
        </Box>
    )
}

const div = document.createElement("div")

function convertToText(html) {
    div.innerHTML = html
    return div.innerText
}

function count(array) {
    return array.reduce((c, a) => {
        c[a] = (c[a] || 0) + 1
        return c
    }, {})
}

function QuizResults({ question }) {
    const { allResponses, target, settings, refresh, user } = useBoundContext()
    const definition = settings.questions[question]
    const responses = Object.values({
        ...(allResponses || {}),
        [user.uid]: target
    })
    const answers = count(responses.map((r) => r.answers[definition.id]))
    return (
        <Box p={1} fontSize="90%">
            <Card elevation={3}>
                {convertToText(definition.explanation).length > 3 ? (
                    <Box
                        ml={2}
                        mr={2}
                        dangerouslySetInnerHTML={{
                            __html: definition.explanation
                        }}
                    />
                ) : null}
                <List dense>
                    {definition.answers.map((answer) => (
                        <AnswerResult
                            key={answer.id}
                            definition={definition}
                            answer={answer}
                            answers={answers}
                            total={responses.length}
                        />
                    ))}
                </List>
                <CardActions>
                    <Button onClick={next} color="primary">
                        Next
                    </Button>
                </CardActions>
            </Card>
        </Box>
    )

    function next() {
        target.question = target.question + 1
        if (target.question >= settings.questions.length) {
            target.state = "done"
        } else {
            target.state = "question"
        }
        refresh()
    }
}

function AnswerResult({ answer, definition, answers, total }) {
    const denominator = definition.answers.reduce(
        (c, a) => c + (answers[a.id] || 0),
        0
    )
    const perc = (answers[answer.id] || 0) / denominator
    const hasCorrect = definition.answers.some((c) => c.correct)

    return (
        <ListItem dense divider>
            {hasCorrect && (
                <Box
                    mr={1}
                    fontSize={"150%"}
                    style={{ opacity: answer.correct ? 1 : 0 }}
                >
                    <MdCheck color="green" />
                </Box>
            )}
            <ListItemText
                primary={
                    <ListItemBox>
                        <Box flex={1}>
                            <span>{convertToText(answer.answer)}</span>{" "}
                        </Box>
                        {!isNaN(perc) && (
                            <Box>
                                <small>({Math.floor(perc * 100)}%)</small>
                            </Box>
                        )}
                    </ListItemBox>
                }
                secondary={
                    <Box flex={1}>
                        <Box
                            width={(answers[answer.id] || 0) / denominator}
                            borderRadius={4}
                            bgcolor={answer.color}
                            height={8}
                        />
                    </Box>
                }
            />
        </ListItem>
    )
}

function QuizEnd() {
    const done = useRef(false)
    const { settings, refresh, target } = useBoundContext()
    const total = settings.questions.filter((q) =>
        q.answers?.some((a) => a.correct)
    ).length
    useEffect(() => {
        if (done.current) return
        done.current = true
        awardPoints(10).catch(console.error)
        if (settings.quizName) {
            addAchievement(50, `Completed Quiz "${settings.quizName}"`).catch(
                console.error
            )
        }
        if (target.score === total) {
            addAchievement(50, `Got 100% in a quiz`).catch(console.error)
        }
    }, [settings, target, total])

    return (
        <>
            {!!convertToText(settings.outtro).trim().length && (
                <Box
                    pl={2}
                    pr={2}
                    fontSize="150%"
                    dangerouslySetInnerHTML={{ __html: settings.outtro }}
                    minHeight={50}
                />
            )}
            {!!settings.showScore && (
                <>
                    <ListItemBox
                        mt={5}
                        justifyContent="center"
                        fontSize="150%"
                        mb={1}
                    >
                        Your Score
                    </ListItemBox>
                    <ListItemBox
                        mb={5}
                        justifyContent="center"
                        fontSize="150%"
                        fontWeight="Bold"
                    >
                        {target.score} / {total}
                    </ListItemBox>
                </>
            )}
            <ListItemBox justifyContent="center">
                <Button
                    onClick={refresh(() => {
                        target.state = "intro"
                        target.question = 0
                        target.score = 0
                    })}
                    variant="contained"
                    color="primary"
                >
                    Try Again
                </Button>
            </ListItemBox>
        </>
    )
}
