import { createContext, useContext, useMemo } from "react"
import { get } from "./get"
import { set } from "./set"
import { useRefresh } from "./useRefresh"
import decamelize from "decamelize"
import { nanoid } from "nanoid"

const BoundContext = createContext({})

export function Bound({ children, ...props }) {
    const context = useContext(BoundContext)
    context.target = context.target || {}
    const id = useMemo(() => nanoid, [])
    return (
        <BoundContext.Provider value={{ ...context, ...props, id }}>
            {children}
        </BoundContext.Provider>
    )
}

export function useBoundContext() {
    return useContext(BoundContext)
}

export function Bind({
    input,
    transformIn = (v) => v,
    transformOut = (v) => v,
    defaultValue,
    sideEffects = false,
    field,
    valueProp = "value",
    onChangeProp = "onChange",
    extract = (v) => {
        if (v && v.target) {
            return v.target.value
        }
        return v
    },
    ...props
}) {
    defaultValue = defaultValue || props.default || ""
    const { onChange, target, refresh } = useBoundContext()
    const myId = useMemo(() => nanoid(), [])
    const localRefresh = useRefresh(onChange)
    set(target, field, get(target, field, defaultValue))
    return (
        <input.type
            id={myId}
            {...input.props}
            {...props}
            {...{
                [valueProp]: transformIn(get(target, field) ?? defaultValue),
                [onChangeProp]: handleChange
            }}
        />
    )

    function handleChange(...params) {
        const value = transformOut(extract(...params))
        set(target, field, value)
        if (sideEffects || input.props.sideEffects) {
            refresh()
        } else {
            localRefresh()
        }
    }
}

export function bind(
    input,
    {
        onProps = (props) => ({
            ...props,
            label: props.label || makeLabelFrom(props.field)
        }),
        ...options
    } = {}
) {
    return function (props) {
        props = onProps(props)
        return <Bind {...options} {...props} input={input} />
    }
}

export function makeLabelFrom(fieldName) {
    if (!fieldName) return undefined
    fieldName = fieldName.split(".").slice(-1)[0]
    return decamelize(fieldName, " ")
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
}
