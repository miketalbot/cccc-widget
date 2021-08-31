export function debounce(fn, wait = 0, { maxWait = Infinity } = {}) {
    let timer = 0
    let startTime = 0
    let running = false
    let pendingParams
    let result = function (...params) {
        pendingParams = params
        if (running && Date.now() - startTime > maxWait) {
            execute()
        } else {
            if (!running) {
                startTime = Date.now()
            }
            running = true
        }

        clearTimeout(timer)
        timer = setTimeout(execute, Math.min(maxWait - startTime, wait))

        function execute() {
            running = false
            fn(...params)
        }
    }
    result.flush = function () {
        if (running) {
            running = false
            clearTimeout(timer)
            fn(...pendingParams)
        }
    }
    result.cancel = function () {
        running = false
        clearTimeout(timer)
    }
    return result
}
