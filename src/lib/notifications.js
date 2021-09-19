import { Snackbar } from "@material-ui/core"
import { Alert, AlertTitle } from "@material-ui/lab"
import { useState } from "react"
import { raise } from "./raise"
import { useEvent } from "./useEvent"

export function showNotification(message, alertProps = { severity: "info" }) {
    raise("show-notification", message, alertProps)
    return true
}

export function SnackBars() {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState({})
    console.log(content)
    useEvent("show-notification", (_, message, alertProps = {}) => {
        setOpen(false)
        setContent({ message, alertProps })
        setOpen(true)
    })
    const { title, ...alertProps } = content.alertProps ?? {}
    return (
        !!content && (
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} {...alertProps}>
                    {title ? <AlertTitle>{title}</AlertTitle> : null}
                    {content.message}
                </Alert>
            </Snackbar>
        )
    )
}
