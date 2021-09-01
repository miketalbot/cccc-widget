import { Dialog } from "@material-ui/core"
import { useState } from "react"
import { raise } from "./raise"
import { useEvent } from "./useEvent"

let dialogId = 0

export function useDialog(content, props = {}) {
    return function open(pass = {}) {
        return new Promise((resolve) => {
            raise("open-dialog", {
                maxWidth: "sm",
                fullWidth: true,
                initialProps: props,
                ...props,
                dialogId: dialogId++,
                content,
                resolve,
                pass
            })
        })
    }
}

export function Dialogs() {
    const [dialogs, setDialogs] = useState([])
    useEvent("open-dialog", (_, dialog) =>
        setDialogs((dialogs) => [...dialogs, dialog])
    )
    useEvent("remove-dialog", (_, dialogId) =>
        setDialogs((dialogs) => dialogs.filter((d) => d.dialogId !== dialogId))
    )
    return dialogs.map((d) => <DialogBox key={d.dialogId} {...d} />)
}

function DialogBox({
    pass,
    resolve,
    dialogId,
    initialProps = {},
    content = null,
    ...props
}) {
    const [open, setOpen] = useState(true)
    const item =
        typeof content === "function" ? { type: content, props: {} } : content
    return (
        <Dialog {...props} open={open} onClose={cancel}>
            <item.type
                {...initialProps}
                {...item.props}
                {...props}
                {...pass}
                ok={ok}
                cancel={cancel}
            />
        </Dialog>
    )

    function ok(value) {
        resolve(value)
        close()
    }

    function cancel() {
        resolve(undefined)
        close()
    }
    function close() {
        setOpen(false)
        setTimeout(() => raise("remove-dialog", dialogId), 600)
    }
}
