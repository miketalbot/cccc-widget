import { createContext, useCallback, useEffect, useRef, useState } from "react"
import useAsync from "./useAsync"
import { useCurrentState } from "./useCurrentState"
import NotchedOutline from "@material-ui/core/OutlinedInput/NotchedOutline"
import InputLabel from "@material-ui/core/InputLabel"
import { Box, makeStyles } from "@material-ui/core"
import classNames from "classnames"
import { fileToBase64 } from "./file-to-base64"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

let cache = {}

function noop() {}

export default HTMLEditor

export const DraftContext = createContext(null)
async function uploadCallback(file) {
    return { data: { link: await fileToBase64(file) } }
}

export const useStyles = makeStyles((theme) => ({
    renderer: {
        "& p": {
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
            marginLeft: theme.spacing(0)
        }
    },
    editor: {
        "& > label": {
            position: "absolute"
        },
        "& .rdw-editor-toolbar *": {
            color: "black"
        },
        userSelect: "none",
        "& .public-DraftStyleDefault-block": {
            margin: "initial"
        },
        "& *": {
            boxSizing: "content-box"
        },
        "& .rdw-editor-toolbar": {
            background: theme.palette.background.paper,
            border: "none",
            padding: 0,
            paddingTop: 4,
            marginRight: theme.spacing(0.5),
            zoom: 0.675
        },
        "& p": {
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
            marginLeft: theme.spacing(1)
        },
        "& .rdw-editor-main": {
            paddingLeft: theme.spacing(1)
        },
        overflow: "visible",
        borderRadius: 4,
        outline: "none",
        position: "relative",
        padding: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        marginBottom: theme.spacing(1),
        "& fieldset": {
            transition: "color 0.2s linear",
            color: theme.palette.action.disabled
        },
        "&:hover fieldset, &:hover label": {
            color: theme.palette.text.primary
        },
        "&:focus-within fieldset, &:focus-within label": {
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 2
        }
    },
    dropUp: {
        top: "initial",
        bottom: 0,
        position: "absolute"
    },
    upload: {
        left: "initial !important",
        right: "5px"
    },
    label: {
        marginLeft: -14,
        marginTop: -4,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    }
}))

export function HTMLRenderer({ html }) {
    const classes = useStyles()
    return (
        <div
            className={classes.renderer}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
export function HTMLEditor({
    value = "",
    onChange = noop,
    onBlur = noop,
    label,
    labelText,
    disabled = false,
    up = false,
    ...props
}) {
    label = labelText || label
    const currentValue = useRef(value)
    const [update, setUpdate] = useState(0)
    useEffect(() => {
        if (currentValue.current !== value) {
            currentValue.current = value
            setUpdate((u) => u + 1)
        }
    }, [value])
    const Draft = useAsync(async () => {
        if (cache.Editor) return cache
        const { ContentState, convertToRaw, EditorState, Modifier } =
            await import("draft-js")
        const { Editor } = await import("react-draft-wysiwyg")
        const draftToHtml = (await import("draftjs-to-html")).default
        const htmlToDraft = (await import("html-to-draftjs")).default
        return (cache = {
            ContentState,
            convertToRaw,
            EditorState,
            Editor,
            draftToHtml,
            htmlToDraft,
            Modifier
        })
    }, cache)
    const {
        ContentState,
        convertToRaw,
        EditorState,
        Editor,
        draftToHtml,
        htmlToDraft
    } = Draft
    //eslint-disable-next-line react-hooks/exhaustive-deps
    const Item = useCallback(InnerHtml, [Editor ? 1 : 0, update])
    return (
        !!Editor && (
            <DraftContext.Provider value={Draft}>
                <Item />
            </DraftContext.Provider>
        )
    )

    function InnerHtml() {
        const [labelWidth, setWidth] = useCurrentState(
            label ? label.length * 9 : 0
        )
        const ref = useRef()

        const [state, setState] = useCurrentState(() => {
            const contentBlock = htmlToDraft(currentValue.current)
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(
                    contentBlock.contentBlocks,
                    contentBlock.entityMap
                )
                let state = EditorState.createWithContent(contentState)
                let selection = state.getSelection().merge({
                    anchorKey: contentState.getFirstBlock().getKey(),
                    anchorOffset: 0,
                    focusOffset: contentState.getLastBlock().getText().length,
                    focusKey: contentState.getLastBlock().getKey()
                })
                return EditorState.acceptSelection(state, selection)
            }
        })
        useEffect(() => {
            if (!ref.current) return
            ref.current.style.display = "inline-block"
            setWidth(ref.current.offsetWidth - 8)
            ref.current.style.display = "block"
        })
        const classes = useStyles()
        return (
            <div className={classes.editor}>
                <NotchedOutline notched={!!label} labelWidth={labelWidth} />
                {label && (
                    <InputLabel
                        ref={ref}
                        classes={{ root: classes.label }}
                        shrink={true}
                        variant="outlined"
                        disableAnimation={true}
                    >
                        {label}
                    </InputLabel>
                )}
                {!disabled && (
                    <Box mt={1} mb={1}>
                        <Editor
                            {...props}
                            onBlur={onBlur}
                            editorState={state}
                            toolbar={{
                                options: [
                                    "inline",
                                    "blockType",
                                    "fontSize",
                                    "fontFamily",
                                    "list",
                                    "textAlign",
                                    "colorPicker",
                                    "link",
                                    "image"
                                ],
                                colorPicker: {
                                    colors: [
                                        "rgba(0,0,0,0)",
                                        "rgb(97,189,109)",
                                        "rgb(26,188,156)",
                                        "rgb(84,172,210)",
                                        "rgb(44,130,201)",
                                        "rgb(147,101,184)",
                                        "rgb(71,85,119)",
                                        "rgb(204,204,204)",
                                        "rgb(65,168,95)",
                                        "rgb(0,168,133)",
                                        "rgb(61,142,185)",
                                        "rgb(41,105,176)",
                                        "rgb(85,57,130)",
                                        "rgb(40,50,78)",
                                        "rgb(0,0,0)",
                                        "rgb(247,218,100)",
                                        "rgb(251,160,38)",
                                        "rgb(235,107,86)",
                                        "rgb(226,80,65)",
                                        "rgb(163,143,132)",
                                        "rgb(239,239,239)",
                                        "rgb(255,255,255)",
                                        "rgb(250,197,28)",
                                        "rgb(243,121,52)",
                                        "rgb(209,72,65)",
                                        "rgb(184,49,47)",
                                        "rgb(124,112,107)",
                                        "rgb(209,213,216)"
                                    ]
                                },
                                blockType: {
                                    inDropdown: true,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                fontSize: {
                                    inDropdown: true,
                                    options: [12, 14, 16, 18, 24, 36, 72],
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                list: {
                                    inDropdown: true,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                inline: {
                                    inDropdown: true,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                textAlign: {
                                    inDropdown: true,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                link: {
                                    inDropdown: true,
                                    popupClassName: classes.upload,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                emoji: {
                                    inDropdown: true,
                                    dropdownClassName: classNames({
                                        [classes.dropUp]: up
                                    })
                                },
                                remove: false,
                                image: {
                                    uploadCallback,
                                    popupClassName: classNames(
                                        { [classes.dropUp]: up },
                                        classes.upload
                                    )
                                }
                            }}
                            onEditorStateChange={(state) => {
                                try {
                                    setState(state)
                                    const rawState = convertToRaw(
                                        state.getCurrentContent()
                                    )
                                    const newValue = draftToHtml(rawState)
                                    if (newValue !== value) {
                                        currentValue.current = newValue
                                        onChange(newValue)
                                    }
                                } catch (e) {
                                    console.error(e)
                                }
                            }}
                        />
                    </Box>
                )}
            </div>
        )
    }
}
