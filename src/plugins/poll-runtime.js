import { IconButton } from "@material-ui/core"
import { nanoid } from "nanoid"
import { MdDelete, MdDragHandle } from "react-icons/md"

const {
    Material: {
        Button,
        TextField,
        Box,
        Card,
        CardContent,
        Typography,
        ThemeProvider,
        CssBaseline
    },
    Loader,
    Sortable,
    SortableItem,
    Plugins: { PluginTypes, register },
    Interaction: { respondUnique, useResponse },
    setFromEvent,
    Binding: {
        useBoundContext,
        Bound,
        Common: { BoundTextField }
    },
    React: { useState },
    ReactDOM,
    theme,
    useRefresh
} = window.Framework4C

register(PluginTypes.MAIN, "Poll", editor, runtime)

function editor({ parent, ...props }) {
    ReactDOM.render(<Editor {...props} />, parent)
}

function Editor({ settings, onChange }) {
    const refresh = useRefresh(onChange)
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Bound refresh={refresh} target={settings} onChange={onChange}>
                <Box mt={2}>
                    <PollConfig />
                </Box>
            </Bound>
        </ThemeProvider>
    )
}

function PollConfig() {
    const { target, refresh } = useBoundContext()
    const answers = (target.answers = target.answers || [])

    return (
        <>
            <BoundTextField field="question" />
            <Box mt={2}>
                <Sortable items={answers} onDragEnd={refresh}>
                    {answers.map((answer, index) => (
                        <Answer key={answer.id} index={index} answer={answer} />
                    ))}
                </Sortable>
            </Box>
            <Button color="primary" onClick={addAnswer}>
                + Answer
            </Button>
        </>
    )

    function addAnswer() {
        answers.push({ id: nanoid(), answer: "" })
        refresh()
    }
}

function Answer({ answer, index }) {
    return (
        <SortableItem
            borderRadius={4}
            bgcolor="#fff8"
            m={1}
            display="flex"
            alignItems="center"
            index={index}
        >
            <Bound target={answer}>
                <Box mr={1}>
                    <MdDragHandle />
                </Box>
                <Box flex={1} mr={1}>
                    <BoundTextField field="answer" />
                </Box>
                <Box flex={0.5} mr={1}>
                    <BoundTextField
                        field="score"
                        transformOut={(v) => parseInt(v)}
                    />
                </Box>
                <IconButton color="secondary">
                    <MdDelete />
                </IconButton>
            </Bound>
        </SortableItem>
    )
}

function runtime({ parent, ...props }) {
    ReactDOM.render(<Runtime {...props} />, parent)
}

function Runtime({ settings, user, response, article, previewMode }) {
    const [showLoader, setShowLoader] = useState()
    const { responses: { Poll } = {} } = useResponse(response)
    const { [user.uid]: myResponse } = Poll || {}
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {showLoader ? (
                <Loader caption={showLoader} />
            ) : (
                <Box m={2} width={1}>
                    {myResponse ? (
                        <>
                            <div>Results</div>
                            {previewMode && (
                                <Button onClick={reset}>Reset</Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Box>
                                <Button onClick={press1}>One</Button>
                            </Box>
                            <Box>
                                <Button onClick={press2}>Two</Button>
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

    async function press1() {
        setShowLoader("Registering your choice")
        await respondUnique(article.uid, "Poll", { pressed: "1" })
        setShowLoader(false)
    }
    async function press2() {
        setShowLoader("Registering your choice")
        await respondUnique(article.uid, "Poll", { pressed: "2" })
        setShowLoader(false)
    }
}
