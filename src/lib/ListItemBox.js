import { Box } from "@material-ui/core"

export function ListItemBox({ children, ...props }) {
    return (
        <Box display="flex" alignItems="center" width={1} {...props}>
            {children}
        </Box>
    )
}
