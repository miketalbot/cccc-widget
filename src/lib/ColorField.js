import {
    Box,
    ClickAwayListener,
    IconButton,
    InputAdornment,
    makeStyles,
    Popper,
    TextField
} from "@material-ui/core"
import { useState } from "react"
import { SketchPicker } from "react-color"
import { MdExpandLess, MdExpandMore } from "react-icons/md"
import { bind } from "./Bound"

const useStyles = makeStyles({
    color: {
        boxShadow: "0 0 0px 1px #eee",
        height: 16,
        width: 16,
        borderRadius: 2
    }
})

export function ColorField({ value, onChange, ...props }) {
    const [open, setOpen] = useState(false)
    const classes = useStyles()
    return (
        <>
            <TextField
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Box
                                role="button"
                                aria-label="Show/hide color picker on the left"
                                className={classes.color}
                                onClick={(e) =>
                                    setOpen((open) =>
                                        open ? false : e.currentTarget
                                    )
                                }
                                bgcolor={value}
                            />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="Show/Hide color picker"
                                onClick={(e) =>
                                    setOpen((open) =>
                                        open ? false : e.currentTarget
                                    )
                                }
                            >
                                {open ? <MdExpandLess /> : <MdExpandMore />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                value={value}
                onChange={onChange}
                {...props}
            />
            <Popper
                style={{ zIndex: 10000 }}
                placement="bottom-end"
                open={!!open}
                anchorEl={open}
            >
                <ClickAwayListener onClickAway={() => open && setOpen(null)}>
                    <SketchPicker
                        onChangeComplete={handlePicker}
                        color={value}
                    />
                </ClickAwayListener>
            </Popper>
        </>
    )

    function handlePicker(color) {
        onChange(color.hex)
    }
}

export const BoundColorField = bind(<ColorField variant="outlined" fullWidth />)
