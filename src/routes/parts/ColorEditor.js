import { CardContent, Grid, Typography } from "@material-ui/core"
import { BoundColorField } from "../../lib/ColorField"
import { UpdateWidget } from "./UpdateWidget"
import { useBoundContext } from "../../lib/Bound"

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
                <Grid container spacing={1.5}>
                    <Grid item md={6}>
                        <BoundColorField
                            sideEffects
                            field="gradientFrom"
                            default="#fe6b8b"
                        />
                    </Grid>
                    <Grid item md={6}>
                        <BoundColorField
                            sideEffects
                            field="gradientTo"
                            default="#ff8e53"
                        />
                    </Grid>
                    <Grid item md={6}>
                        <BoundColorField
                            sideEffects
                            field="bottomBackground"
                            default="#333333"
                        />
                    </Grid>
                    <Grid item md={6}>
                        <BoundColorField
                            sideEffects
                            field="bottomColor"
                            default="#ffffff"
                        />
                    </Grid>
                </Grid>
            </CardContent>
            <UpdateWidget
                accessibility={console.warn}
                article={article.uid}
                useArticle={article}
            />
        </>
    )
}
