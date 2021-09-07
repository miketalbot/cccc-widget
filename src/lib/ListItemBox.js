import { Box } from "@material-ui/core"
import { forwardRef } from "react"

export const ListItemBox = forwardRef(function ListItemBox(
    { children, ...props },
    ref
) {
    return (
        <Box ref={ref} display="flex" alignItems="center" width={1} {...props}>
            {children}
        </Box>
    )
})
