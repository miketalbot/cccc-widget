import { TextField } from "@material-ui/core"
import { bind } from "./Bound"
import { Autocomplete } from "@material-ui/lab"
import HTMLEditor from "./HtmlEditor"

export const BoundTextField = bind(<TextField fullWidth variant="outlined" />)

export const BoundAutocomplete = bind(
    <Autocomplete
        renderInput={(p) => <TextField variant="outlined" fullWidth {...p} />}
    />,
    {
        extract: (_, v) => v
    }
)

export const BoundHTMLEditor = bind(<HTMLEditor />)
