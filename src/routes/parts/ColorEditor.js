import { Box, CardContent, Typography } from "@material-ui/core"
import { BoundColorField } from "../../lib/ColorField"
import { UpdateWidget } from "./UpdateWidget"
import { useBoundContext } from "../../lib/Bound"
import { ListItemBox } from "../../lib/ListItemBox"

export function ColorEditor() {
    const { target: article } = useBoundContext()
    return (
        <>
            <Typography gutterBottom variant="body2">
                Some plugins may override the color choices that you make here
                to create a more consistent visual experience for the reader.
            </Typography>
            <Typography gutterBottom variant="body2" color="textSecondary">
                The standard 4C plugin overrides these values for the fire
                effect.
            </Typography>
            <CardContent>
                <ListItemBox width={1}>
                    <Box mr={1} flex={1}>
                        <BoundColorField
                            sideEffects
                            field="gradientFrom"
                            default="#fe6b8b"
                        />
                    </Box>
                    <Box flex={1}>
                        <BoundColorField
                            sideEffects
                            field="gradientTo"
                            default="#ff8e53"
                        />
                    </Box>
                </ListItemBox>
            </CardContent>
            <CardContent>
                <ListItemBox>
                    <Box mr={1} flex={1}>
                        <BoundColorField
                            sideEffects
                            field="bottomBackground"
                            default="#333333"
                        />
                    </Box>
                    <Box flex={1}>
                        <BoundColorField
                            sideEffects
                            field="bottomColor"
                            default="#ffffff"
                        />
                    </Box>
                </ListItemBox>
            </CardContent>
            <UpdateWidget
                accessibility={console.warn}
                article={article.uid}
                useArticle={article}
            />
        </>
    )
}
