import {
    Box,
    Card,
    CardContent,
    CardHeader,
    makeStyles,
    Container,
    useTheme
} from "@material-ui/core"
import { Administration } from "./parts/Administration"
import { MdPerson } from "react-icons/md"
import { FaComment, FaRegNewspaper } from "react-icons/fa"
import { navigate } from "../lib/routes"
import "./admin-profile"
import "./admin-article"
import "./admin-articles"

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
                        title="Articles"
                        icon={<FaRegNewspaper />}
                        onClick={() => navigate("/admin/articles")}
                    >
                        Manage Your Articles
                    </Panel>
                    <Panel
                        title="Comments"
                        icon={<FaComment />}
                        onClick={() => navigate("/admin/comments")}
                    >
                        Manage Your Comments
                    </Panel>
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
        <Box width={1 / 4} m={1} minWidth={220} clone>
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
