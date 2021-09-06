export function handle(event, handler) {
    window.addEventListener(event, handler)
    return () => {
        window.removeEventListener(event, handler)
    }
}
