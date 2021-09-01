import { useEffect, useState } from "react"
import { raise, raiseWithOptions } from "./raise"
import { useDebouncedEvent } from "./useEvent"

const routes = []

export function Route({ path, children }) {
    useEffect(() => {
        return register(path, children)
    }, [path, children])

    return null
}

export function register(path, call) {
    if (typeof call === "function" || call._init) {
        return add({ path: path.split("/"), call })
    } else if (typeof call === "object" && call) {
        return add({
            path: path.split("/"),
            call: (props) => <call.type {...call.props} {...props} />
        })
    }

    function add(item) {
        routes.push(item)
        raise("routesChanged")
        return () => {
            let idx = routes.indexOf(item)
            if (idx >= 0) routes.splice(idx, 1)
            raise("routesChanged")
        }
    }
}

function Fallback({ path }) {
    return <div>{path}</div>
}

export function navigate(url, state = {}) {
    window.history.pushState(state, "", url)
    raiseWithOptions("popstate", { state })
}

export function useLocation() {
    const [location, setLocation] = useState(window.location)
    useDebouncedEvent("popstate", () => setLocation({ ...window.location }), 30)
    return location
}

const headings = ["h1", "h2", "h3", "h4", "h5", "h6", "h7"]

export function Router({
    path: initialPath,
    fallback = <Fallback />,
    component = <section />
}) {
    const { pathname } = useLocation()
    const path = initialPath || pathname
    const parts = path.split("/")
    const route = routes.find(
        (route) =>
            route.path.length === parts.length &&
            parts.every(partMatches(route))
    )

    if (!route) return <fallback.type {...fallback.props} path={path} />
    const params = route.path.reduce(mergeParams, { path })
    return (
        <component.type {...component.props} ref={setFocus}>
            <route.call {...params} />
        </component.type>
    )

    function setFocus(target) {
        if (!target) return
        let found
        headings.find((heading) => (found = target.querySelector(heading)))
        if (found) {
            found.focus()
        }
    }

    function mergeParams(params, part, index) {
        if (part.startsWith(":")) {
            params[part.slice(1)] = parts[index]
        }
        return params
    }

    function partMatches(route) {
        return function (part, index) {
            return (
                route.path[index].startsWith(":") || route.path[index] === part
            )
        }
    }
}
