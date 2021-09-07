import {
    Box,
    Button,
    ButtonGroup,
    CardContent,
    CssBaseline,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    ThemeProvider,
    Typography
} from "@material-ui/core"
import { nanoid } from "nanoid"
import randomColor from "randomcolor"
import React, { useState } from "react"
import reactDom from "react-dom"
import { FaEllipsisV } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { Bound, useBoundContext } from "../lib/Bound"
import { BoundTextField } from "../lib/bound-components"
import { BoundColorField } from "../lib/ColorField"
import { downloadObject } from "../lib/downloadObject"
import { ListItemBox } from "../lib/ListItemBox"
import { Odometer } from "../lib/odometer"
import { PluginTypes, register } from "../lib/plugins"
import { setFromEvent } from "../lib/setFromEvent"
import { Sortable, SortableItem } from "../lib/Sortable"
import { theme } from "../lib/theme"
import { UploadButton } from "../lib/uploadButton"
import { useDialog } from "../lib/useDialog"
import { useEvent } from "../lib/useEvent"
import { useRefresh } from "../lib/useRefresh"

register(PluginTypes.MAIN, "Poll", editor)

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
                    <PollConfig />
                </Box>
            </Bound>
        </ThemeProvider>
    )
}

function PollConfig() {
    const { target, refresh } = useBoundContext()
    const answers = (target.answers = target.answers || [])
    const getName = useDialog(DownloadName)
    return (
        <>
            <ListItemBox>
                <Box flex={1} />
                <ButtonGroup size="small">
                    <UploadButton
                        accept="*.poll.json"
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
        answers.push({ id: nanoid(), answer: "", color: randomColor() })
        refresh()
    }
}

export function DownloadName({ ok, cancel }) {
    const [name, setName] = useState("")
    return (
        <>
            <DialogTitle>Name</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    value={name}
                    onChange={setFromEvent(setName)}
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={cancel}>Cancel</Button>
                <Button
                    onClick={() => ok(name)}
                    color="secondary"
                    variant="contained"
                >
                    Create
                </Button>
            </DialogActions>
        </>
    )
}

export function Answer({ answers, answer }) {
    const { refresh, response } = useBoundContext()
    const [dragProps, setDragProps] = useState({})
    useEvent("response", useRefresh())

    const votes = Object.values(response?.responses?.Poll || {}).reduce(
        (c, a) => (a === answer.id ? c + 1 : c),
        0
    )
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
                <Box flex={0.6} mr={1}>
                    <BoundTextField
                        field="answer"
                        InputProps={{
                            endAdornment: (
                                <Box
                                    ml={1}
                                    textAlign="right"
                                    color="#666"
                                    whiteSpace="nowrap"
                                >
                                    <small>
                                        <Odometer>{votes}</Odometer> vote
                                        <span
                                            style={{
                                                opacity: votes === 1 ? 0 : 1
                                            }}
                                        >
                                            s
                                        </span>
                                    </small>
                                </Box>
                            )
                        }}
                    />
                </Box>
                <Box flex={0.4} mr={1}>
                    <BoundTextField field="legend" />
                </Box>
                <Box flex={0.5} mr={1}>
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
