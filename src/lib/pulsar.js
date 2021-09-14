import { makeStyles } from "@material-ui/core"
import { useCallback } from "react"
import { reduceMotion } from "./reduce-motion"
const usePulsar = makeStyles({
    "@keyframes pulsing": {
        "0%": {
            transform: "rotate(0deg) scale(1)"
        },
        // "30%": {
        //     transform: "rotate(-0deg) scale(1.03)"
        // },
        "50%": {
            transform: "rotate(-0deg) scale(1.03)"
        },
        // "70%": {
        //     transform: "rotate(0deg) scale(1.03)"
        // },
        "95%": {
            transform: "rotate(0deg) scale(1)"
        }
    },
    pulse: {
        animation: "1s $pulsing"
    }
})

export function Pulsar({ children }) {
    const classes = usePulsar()
    const animate = useCallback(
        function animate(target) {
            if (!target) return
            if (reduceMotion()) return
            setTimeout(() => {
                target.className = classes.pulse
                setTimeout(() => {
                    target.className = ""
                    if (document.body.contains(target)) {
                        animate(target)
                    }
                }, 3500 + Math.random() * 1000)
            }, Math.random() * 1000 + 500)
        },
        [classes]
    )
    return <div ref={animate}>{children}</div>
}
