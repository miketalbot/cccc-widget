import {
    Box,
    Button,
    CardContent,
    CssBaseline,
    IconButton,
    ThemeProvider,
    Typography
} from "@material-ui/core"
import { nanoid } from "nanoid"
import randomColor from "randomcolor"
import React, { useRef, useState } from "react"
import reactDom from "react-dom"
import { FaEllipsisV } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { Bound, useBoundContext } from "../lib/Bound"
import { BoundTextField } from "../lib/bound-components"
import { BoundColorField } from "../lib/ColorField"
import { PluginTypes, register } from "../lib/plugins"
import { Sortable, SortableItem } from "../lib/Sortable"
import { theme } from "../lib/theme"
import { useRefresh } from "../lib/useRefresh"

register(PluginTypes.MAIN, "Poll", editor)

function editor({ parent, ...props }) {
    reactDom.render(<Editor {...props} />, parent)
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
            <CardContent>
                <BoundTextField field="question" />
            </CardContent>
            <CardContent>
                <BoundTextField field="description" />
            </CardContent>
            <CardContent>
                <BoundColorField field="questionColor" default="white" />
            </CardContent>
            <CardContent>
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
            </CardContent>
            <Button color="primary" onClick={addAnswer}>
                + Answer
            </Button>
        </>
    )

    function addAnswer() {
        answers.push({ id: nanoid(), answer: "", color: randomColor() })
        refresh()
    }
}

function Answer({ answers, answer }) {
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
                <Box flex={1} mr={1}>
                    <BoundTextField field="answer" />
                </Box>
                <Box flex={0.3} mr={1}>
                    <BoundTextField field="legend" />
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
