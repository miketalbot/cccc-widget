import {
    Avatar,
    Box,
    Button,
    ButtonGroup,
    CardContent,
    CssBaseline,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    makeStyles,
    Paper,
    ThemeProvider,
    Typography
} from "@material-ui/core"
import reactDom from "react-dom"
import { PluginTypes, register } from "../lib/plugins"
import { theme } from "../lib/theme"
import { useRefresh } from "../lib/useRefresh"
import { Bound, useBoundContext } from "../lib/Bound"
import { useDialog } from "../lib/useDialog"
import { DownloadName } from "./poll-editor"
import { ListItemBox } from "../lib/ListItemBox"
import { UploadButton } from "../lib/uploadButton"
import {
    BoundHTMLEditor,
    BoundStandardSwitch,
    BoundTextField
} from "../lib/bound-components"
import { BoundColorField } from "../lib/ColorField"
import { Sortable, SortableItem } from "../lib/Sortable"
import { downloadObject } from "../lib/downloadObject"
import { nanoid } from "nanoid"
import randomColor from "randomcolor"
import { MdCheck, MdClear, MdDelete } from "react-icons/md"
import { FaEllipsisV } from "react-icons/fa"
import { useCallback, useState } from "react"
import { useEvent } from "../lib/useEvent"
import { raise } from "../lib/raise"

register(PluginTypes.MAIN, "Quiz", editor, undefined)

function editor({ parent, ...props }) {
    reactDom.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange, response }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Bound
                refresh={refresh}
                target={settings}
                onChange={onChange}
                response={response}
            >
                <Box mt={2}>
                    <QuizConfig />
                </Box>
            </Bound>
        </ThemeProvider>
    )
}

function QuizConfig() {
    const [selected, setSelected] = useState(null)
    const { target, refresh } = useBoundContext()
    const questions = (target.questions = target.questions || [])
    const getName = useDialog(DownloadName)
    return (
        <>
            <ListItemBox>
                <Box flex={1} />
                <ButtonGroup size="small">
                    <UploadButton
                        accept="*.quiz.json"
                        variant="outlined"
                        color="primary"
                        onFile={load}
                    >
                        Load
                    </UploadButton>
                    <Button onClick={save} variant="outlined" color="secondary">
                        Save
                    </Button>
                </ButtonGroup>
            </ListItemBox>
            <CardContent>
                <BoundTextField sideEffects field="quizName" default="" />
            </CardContent>
            {target.quizName?.length > 5 && (
                <>
                    <CardContent>
                        <ListItemBox>
                            <Box mr={1} flex={1}>
                                <BoundColorField
                                    field="questionColor"
                                    default="#1b1b1b"
                                />
                            </Box>
                            <Box>
                                <BoundStandardSwitch
                                    field="showScore"
                                    default={true}
                                />
                            </Box>
                        </ListItemBox>
                    </CardContent>
                    <CardContent>
                        <BoundHTMLEditor field="introduction" />
                    </CardContent>
                    <CardContent>
                        <BoundHTMLEditor field="outtro" />
                    </CardContent>
                    <CardContent>
                        <Typography gutterBottom variant="overline">
                            Questions
                        </Typography>
                        <Box mr={1} maxHeight={200} overflow="auto">
                            <List>
                                <Sortable items={questions} onDragEnd={refresh}>
                                    {questions.map((question, index) => (
                                        <Question
                                            question={question}
                                            index={index}
                                            key={question.id}
                                            select={setSelected}
                                            selected={selected}
                                            questions={questions}
                                        />
                                    ))}
                                </Sortable>
                            </List>
                        </Box>
                        <Button color="primary" onClick={addAnswer}>
                            + Question
                        </Button>
                        <Box flex={1} mt={2}>
                            {selected && <QuestionEditor question={selected} />}
                        </Box>
                    </CardContent>
                </>
            )}
        </>
    )
    async function save() {
        const name = await getName()
        if (name) {
            downloadObject(target, `${name}.poll.json`)
        }
    }

    function load(data) {
        if (data) {
            Object.assign(target, data)
            refresh()
        }
    }

    function addAnswer() {
        questions.push({ id: nanoid(), question: "<p>New question</p>" })
        refresh()
    }
}

function QuestionEditor({ question }) {
    const { onChange } = useBoundContext()
    const changeQuestion = useCallback(() => {
        raise(`refresh-question-${question.id}`)
        onChange()
    }, [onChange, question.id])
    const refresh = useRefresh(changeQuestion)
    const answers = (question.answers = question.answers || [])

    return (
        <Bound target={question} refresh={refresh} onChange={changeQuestion}>
            <Paper elevation={3}>
                <CardContent>
                    <BoundHTMLEditor field="question" />
                    <Typography variant="overline" component="h3" gutterBottom>
                        Answers
                    </Typography>
                    <Sortable items={answers} onDragEnd={refresh}>
                        {answers.map((answer) => (
                            <Answer
                                answers={answers}
                                key={answer.id}
                                answer={answer}
                            />
                        ))}
                    </Sortable>
                    <Button color="primary" onClick={addAnswer}>
                        + Answer
                    </Button>
                    <Typography variant="overline" component="h3" gutterBottom>
                        After Answered
                    </Typography>
                    <BoundHTMLEditor field="explanation" />
                </CardContent>
            </Paper>
        </Bound>
    )

    function addAnswer() {
        answers.push({ id: nanoid(), answer: "", color: randomColor() })
        refresh()
    }
}

const useStyles = makeStyles({
    question: {
        flex: 1
    },
    number: {
        backgroundColor: "#ff5722",
        color: "white"
    }
})

function Question({ question, index, questions, selected, select }) {
    const classes = useStyles()
    const { refresh } = useBoundContext()
    useEvent(`refresh-question-${question.id}`, refresh)
    const [dragProps, setDragProps] = useState({})
    return (
        <SortableItem
            borderRadius={4}
            bgcolor="#fff8"
            setDragProps={setDragProps}
            width={1}
            display="flex"
            alignItems="center"
            id={question.id}
        >
            <Box
                aria-label="Drag handle"
                mr={1}
                color="#444"
                fontSize={16}
                {...dragProps}
            >
                <FaEllipsisV />
            </Box>
            <ListItem
                classes={{ container: classes.question }}
                onClick={() => select(question)}
                dense
                button
                selected={selected === question}
            >
                <ListItemAvatar>
                    <Avatar className={classes.number}>{index + 1}</Avatar>
                </ListItemAvatar>
                <Box
                    maxHeight={64}
                    overflow="auto"
                    dangerouslySetInnerHTML={{ __html: question.question }}
                />
                <ListItemSecondaryAction>
                    <IconButton
                        color="secondary"
                        onClick={remove}
                        aria-label="delete"
                    >
                        <MdDelete />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        </SortableItem>
    )

    function remove() {
        questions.splice(questions.indexOf(question), 1)
        select(null)
        refresh()
    }
}

export function Answer({ answers, answer }) {
    const { refresh } = useBoundContext()
    const [dragProps, setDragProps] = useState({})

    return (
        <SortableItem
            borderRadius={4}
            bgcolor="#fff8"
            setDragProps={setDragProps}
            m={1}
            display="flex"
            alignItems="center"
            id={answer.id}
        >
            <Bound target={answer} refresh={refresh}>
                <Box
                    aria-label="Drag handle"
                    mr={1}
                    color="#444"
                    fontSize={16}
                    {...dragProps}
                >
                    <FaEllipsisV />
                </Box>
                <Box flex={0.8} mr={1}>
                    <BoundHTMLEditor field="answer" />
                </Box>
                <Box mr={1}>
                    <BoundStandardSwitch
                        field="correct"
                        label={
                            answer.correct ? (
                                <MdCheck color="green" />
                            ) : (
                                <MdClear color="red" />
                            )
                        }
                    />
                </Box>
                <Box flex={0.3} mr={1}>
                    <BoundColorField field="color" default="#999999" />
                </Box>
                <IconButton
                    aria-label="Delete"
                    onClick={remove}
                    color="secondary"
                >
                    <MdDelete />
                </IconButton>
            </Bound>
        </SortableItem>
    )

    function remove() {
        const idx = answers.indexOf(answer)
        if (idx !== -1) {
            answers.splice(idx, 1)
            refresh()
        }
    }
}
