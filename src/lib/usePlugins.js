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
                if (url.includes(".babel") || url.includes(".jsx")) {
                    hadBabel = true
                    type = "text/babel"
                    await loadBabel()
                }
                if (document.body.querySelector(`script[src~="${url}"]`))
                    continue
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
                if (url.includes(".babel") || url.includes(".jsx")) {
                    hadBabel = true
                    type = "text/babel"
                    await loadBabel()
                }
                if (document.body.querySelector(`script[src~="${url}"]`))
                    continue
                const script = document.createElement("script")
                script.type = type
                script.src = `${url}?${Date.now()}`
                script.setAttribute("data-presets", "my-preset")
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
        const babelUrl = "https://unpkg.com/@babel/standalone@7.4.4/babel.js"
        if (document.body.querySelector(`script[src='${babelUrl}']`)) return
        const script = document.createElement("script")
        script.src = babelUrl
        script.onload = () => {
            window.dispatchEvent(new Event("DOMContentLoaded"))
            const setup = document.createElement("script")
            setup.text = `
Babel.registerPreset("my-preset", {
  presets: [
      [Babel.availablePresets["es2015"]],
    [Babel.availablePresets["react"]]
  ],
  plugins: [
    [Babel.availablePlugins["transform-modules-amd"]]
  ],
  moduleId: "main"
});
`
            document.body.appendChild(setup)
            window.dispatchEvent(new Event("DOMContentLoaded"))
            const require = document.createElement("script")
            require.onload = resolve
            require.src =
                "https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"
            document.body.appendChild(require)
        }
        document.body.appendChild(script)
    })
}
