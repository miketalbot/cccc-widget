import {
    Box,
    Card,
    CardContent,
    CardHeader,
    makeStyles,
    Container,
    useTheme
} from "@material-ui/core"
import { Administration } from "./Administration"
import { MdPerson } from "@react-icons/all-files/md/MdPerson"
import "./admin-profile"
import { navigate } from "../lib/routes"

export default function AdminPage() {
    return (
        <Administration>
            <Container>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    alignItems="flex-start"
                    justifyContent="space-around"
                >
                    <Panel
                        title="Profile"
                        icon={<MdPerson />}
                        onClick={() => navigate("/admin/profile")}
                    >
                        Configure Your Profile
                    </Panel>
                </Box>
            </Container>
        </Administration>
    )
}

const useStyles = makeStyles({
    button: {
        cursor: "pointer"
    }
})

function Panel({ icon, children, title, onClick = () => {} }) {
    const theme = useTheme()
    const classes = useStyles()
    return (
        <Box width={1 / 3} clone>
            <Card
                onClick={onClick}
                role="button"
                aria-label={title}
                className={classes.button}
                elevation={10}
                component="button"
            >
                <CardHeader title={title} />
                {!!icon && (
                    <Box color={theme.palette.secondary.main} fontSize={96}>
                        {icon}
                    </Box>
                )}
                <CardContent>{children}</CardContent>
            </Card>
        </Box>
    )
}
