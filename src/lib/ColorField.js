import {
    Box,
    ClickAwayListener,
    IconButton,
    InputAdornment,
    Popper,
    TextField
} from "@material-ui/core"
import { useState } from "react"
import { CompactPicker } from "react-color"
import { FaSquare } from "react-icons/fa"
import { MdExpandLess, MdExpandMore } from "react-icons/md"
import { bind } from "./Bound"

export function ColorField({ value, onChange, ...props }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <TextField
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Box color={value}>
                                <FaSquare />
                            </Box>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
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
            <Popper placement="bottom-end" open={!!open} anchorEl={open}>
                <ClickAwayListener onClickAway={() => open && setOpen(null)}>
                    <CompactPicker
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
