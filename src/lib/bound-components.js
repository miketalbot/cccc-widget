import { FormControlLabel, Switch, TextField } from "@material-ui/core"
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

export function StandardSwitch({
    value,
    onChange = () => {},
    label,
    ...props
}) {
    return (
        <FormControlLabel
            {...props}
            control={
                <Switch
                    {...props}
                    checked={value}
                    onChange={(e) => onChange(!!e.target.checked)}
                />
            }
            label={label}
        />
    )
}

export const BoundStandardSwitch = bind(<StandardSwitch />)
