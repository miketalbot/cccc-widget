import { useEffect } from "react"
import { BiHandicap } from "react-icons/bi"

export function usePlugins(definition, deps = []) {
    useEffect(() => {
        if (!definition) return
        setTimeout(async () => {
            const plugins = definition
                .split("\n")
                .map((c) => c.trim())
                .filter((c) => !!c)
            let hadBabel = false
            for (let url of plugins) {
                let type
                if (url.includes(".editor")) continue
                if (document.body.querySelector(`script[src~="${url}"]`))
                    continue
                if (url.includes(".babel") || url.includes(".jsx")) {
                    hadBabel = true
                    type = "text/babel"
                    await loadBabel()
                }
                const script = document.createElement("script")
                script.type = type
                script.src = `${url}?${Date.now()}`
                script.setAttribute("data-presets", "env,react")
                document.body.appendChild(script)
            }
            if (hadBabel) {
                window.dispatchEvent(new Event("DOMContentLoaded"))
            }
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps])
}

export async function loadPlugins(plugins) {
    let hadBabel = false
    for (let url of plugins) {
        let type
        if (url.endsWith(".bundle")) {
            const response = await fetch(url)
            if (!response.ok) {
                console.warn("Could not load bundle", url)
                continue
            }
            const usedBabel = await loadPlugins(
                (
                    await response.text()
                )
                    .split("\n")
                    .map((c) => c.trim())
                    .filter((c) => !!c)
            )
            hadBabel = hadBabel || usedBabel
            continue
        }
        if (document.body.querySelector(`script[src~="${url}"]`)) continue
        if (url.includes(".babel") || url.includes(".jsx")) {
            hadBabel = true
            type = "text/babel"
            await loadBabel()
        }
        const script = document.createElement("script")
        script.type = type
        script.setAttribute("data-presets", "env,react")
        script.setAttribute("data-plugins", "transform-modules-umd")
        script.src = url
        document.body.appendChild(script)
    }
    return hadBabel
}

export function useEditorPlugins(definition, deps = []) {
    useEffect(() => {
        if (!definition) return
        setTimeout(async () => {
            const plugins = definition
                .split("\n")
                .map((c) => c.trim())
                .filter((c) => !!c)

            if (await loadPlugins(plugins)) {
                window.dispatchEvent(new Event("DOMContentLoaded"))
            }
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps])
}

function loadBabel() {
    return new Promise((resolve) => {
        const babelUrl = "https://unpkg.com/@babel/standalone/babel.min.js"
        if (document.body.querySelector(`script[src='${babelUrl}']`)) {
            return resolve()
        }
        const script = document.createElement("script")
        script.src = babelUrl
        script.onload = () => {
            resolve()
        }
        document.body.appendChild(script)
    })
}
