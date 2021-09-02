import { useEffect } from "react"

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

export function useEditorPlugins(definition, deps = []) {
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
                if (document.body.querySelector(`script[src~="${url}"]`))
                    continue
                if (url.includes(".babel") || url.includes(".jsx")) {
                    hadBabel = true
                    type = "text/babel"
                    await loadBabel()
                }
                const script = document.createElement("script")
                script.type = type
                script.setAttribute("data-presets", "env,react")
                script.setAttribute("data-type", "module")
                script.src = url
                document.body.appendChild(script)
            }
            if (hadBabel) {
                window.dispatchEvent(new Event("DOMContentLoaded"))
            }
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps])
}

function loadBabel() {
    return new Promise((resolve) => {
        const babelUrl = "https://unpkg.com/@babel/standalone/babel.min.js"
        if (document.body.querySelector(`script[src='${babelUrl}']`)) return
        const script = document.createElement("script")
        script.src = babelUrl
        script.onload = resolve
        document.body.appendChild(script)
    })
}
