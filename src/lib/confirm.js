import { raise } from "./raise"
import { nanoid } from "nanoid"
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@material-ui/core"

export function confirm(message, title = "") {
    return new Promise((resolve) => {
        raise("open-dialog", {
            maxWidth: "sm",
            fullWidth: true,
            dialogId: nanoid(),
            content: <Confirm message={message} title={title} />,
            resolve
        })
    })
}

function Confirm({ message, title, ok, cancel }) {
    return (
        <>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>{message}</DialogContent>
            <DialogActions>
                <Button onClick={cancel} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={() => ok(true)}
                    color="primary"
                    variant="contained"
                >
                    Ok
                </Button>
            </DialogActions>
        </>
    )
}
