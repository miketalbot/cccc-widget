import { CardContent, IconButton, TextField } from "@material-ui/core"
import { MdContentCopy } from "react-icons/md"
import { useBoundContext } from "../../lib/Bound"

export function EmbedInfo() {
    const {
        target: { uid }
    } = useBoundContext()
    return (
        <>
            <CardContent>
                <TextField
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() =>
                                    copyTextToClipboard(
                                        `{% codesandbox n4dpo initialpath=/${uid}/embed runonclick=0 %}`
                                    )
                                }
                                color="primary"
                            >
                                <MdContentCopy />
                            </IconButton>
                        )
                    }}
                    variant="outlined"
                    label="Dev"
                    value={`{% codesandbox n4dpo initialpath=/${uid}/embed %}`}
                    readOnly
                />
            </CardContent>
            <CardContent>
                <TextField
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() =>
                                    copyTextToClipboard(
                                        `https://codesandbox.io/s/embed-widget-n4dpo-n4dpo?initialpath=${uid}%2Fembed&view=preview`
                                    )
                                }
                                color="primary"
                            >
                                <MdContentCopy />
                            </IconButton>
                        )
                    }}
                    variant="outlined"
                    label="Medium / Hackernoon & other Embedly"
                    value={`https://codesandbox.io/s/embed-widget-n4dpo-n4dpo?initialpath=${uid}%2Fembed&view=preview`}
                    readOnly
                />
            </CardContent>
            <CardContent>
                <TextField
                    multiline
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() =>
                                    copyTextToClipboard(`<iframe
  src="https://cccc-widget.web.app/${uid}"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>`)
                                }
                                color="primary"
                            >
                                <MdContentCopy />
                            </IconButton>
                        )
                    }}
                    fullWidth
                    variant="outlined"
                    label="iframe"
                    value={`<iframe
  src="https://cccc-widget.web.app/${uid}"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>`}
                />
            </CardContent>
        </>
    )
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea")
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = "0"
    textArea.style.left = "0"
    textArea.style.position = "fixed"

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
        var successful = document.execCommand("copy")
        var msg = successful ? "successful" : "unsuccessful"
        console.log("Fallback: Copying text command was " + msg)
    } catch (err) {
        console.error("Fallback: Oops, unable to copy", err)
    }

    document.body.removeChild(textArea)
}
function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text)
        return
    }
    navigator.clipboard.writeText(text)
}
