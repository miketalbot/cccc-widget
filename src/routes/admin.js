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
import { AllUniqueVisits } from "./parts/AllUniqueVisits"
import { AllVisits } from "./parts/AllVisits"
import { MdPerson } from "react-icons/md"
import { FaComment, FaRegNewspaper } from "react-icons/fa"
import { navigate } from "../lib/routes"
import "./admin-profile"
import "./admin-article"
import "./admin-comments"
import "./admin-comment"
import "./admin-articles"
import "../plugins/editor"

export default function AdminPage() {
    return (
        <Administration>
            <Container disableGutters={true}>
                <Box
                    mb={5}
                    height={100}
                    fontSize={window.innerWidth < 1280 ? 24 : 32}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box mr={1} color="#333">
                        <AllVisits />
                    </Box>
                    <Box mr={1} color="#333">
                        <AllUniqueVisits />
                    </Box>
                </Box>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    alignItems="stretch"
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
                        title="Comments &amp; Embeds"
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
