export function raise(eventName, ...params) {
    console.log(params)
    const event = new Event(eventName)
    event._parameters = params
    window.dispatchEvent(event)
    return params[0]
}

export function raiseWithOptions(eventName, options, ...params) {
    const event = new Event(eventName)
    Object.assign(event, options)
    event._parameters = params
    window.dispatchEvent(event)
    return params[0]
}
