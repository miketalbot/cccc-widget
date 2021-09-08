import { useEffect, useState } from "react"
import { confirm } from "./confirm"
import { raise, raiseWithOptions } from "./raise"
import { useDebouncedEvent } from "./useEvent"

const routes = []

export function Route({ path, children }) {
    useEffect(() => {
        return register(path, children)
    }, [path, children])

    return null
}

function inPriorityOrder(a, b) {
    return +(a?.priority ?? 100) - +(b?.priority ?? 100)
}

export function register(path, call, priority = 100) {
    if (!path || typeof path !== "string") {
        throw new Error("Path must be a string")
    }
    const [route, query] = path.split("?")
    if (typeof call === "function" || call._init) {
        return add({
            path: route.split("/"),
            call,
            priority,
            query: query ? query.split("&") : undefined
        })
    } else if (typeof call === "object" && call) {
        return add({
            path: route.split("/"),
            priority,
            query: query ? query.split("&") : undefined,
            call: (props) => <call.type {...call.props} {...props} />
        })
    }

    function add(item) {
        routes.push(item)
        routes.sort(inPriorityOrder)
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
    const [location, setLocation] = useState({ ...window.location })
    useDebouncedEvent(
        "popstate",
        async () => {
            const { message } = raise("can-navigate", {})
            if (message) {
                if (!(await confirm(message))) {
                    window.history.pushState(location.state, "", location.href)
                    return
                }
            }
            setLocation({ ...window.location })
        },
        30
    )

    return location
}

const headings = ["h1", "h2", "h3", "h4", "h5", "h6", "h7"]

export function Router({
    path: initialPath,
    fallback = <Fallback />,
    component = <section />
}) {
    const { pathname } = useLocation()
    const [path, query] = (initialPath || pathname).split("?")
    const parts = path.split("/")
    const route = routes.find(
        (route) =>
            route.path.length === parts.length &&
            parts.every(partMatches(route))
    )

    if (!route) return <fallback.type {...fallback.props} path={path} />
    const params = route.path.reduce(mergeParams, { path })
    const queryParams = query
        ? query.split("&").reduce((c, a) => {
              const parts = a.split("=")
              c[parts[0]] = parts[1]
              return c
          }, {})
        : {}
    if (route.query) {
        route.query.forEach((p) => (params[p] = queryParams[p]))
    }
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
