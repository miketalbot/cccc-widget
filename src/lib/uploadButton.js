import { readAndCompressImage } from "browser-image-resizer"

import { IconButton } from "@material-ui/core"

import { fileToBase64 } from "./file-to-base64"

/**
 * A wrapper function for event handlers that
 * ensure the event does not bubble.  Very
 * useful when clicks might trigger a higher
 * level click when using an embedded button.
 * @example
 * <Button onClick={prevent(handleClick)}/>
 * @param {function} fn - the event handler that should be allowed to run
 * @param {boolean} [defaultOnly] - whether only preventDefault should be called, otherwise stopPropagation is also called
 * @returns {function}
 */
export function prevent(fn, defaultOnly) {
    return (e, ...params) => {
        e && e.preventDefault()
        !defaultOnly && e && e.stopPropagation()
        fn(e, ...params)
    }
}

function noop() {}

/**
 * @callback NotificationFunction
 * @param {boolean} running - true if the notified operation has started
 */

/**
 * @callback FileCallback
 * @param {string} file - the base64 encoded file that has been uploaded
 */

/**
 * @class ImageUploadButtonProps
 * @implements RecordType
 * @property {number} [maxWidth] - the maximum width of the image, the image will be resized to fit if larger.
 * @property {number} [maxHeight=10000] - the maximum height of the image, the image will be resized to fit if larger.
 * @property {NotificationFunction} [onLoading] - a callback for when the image is being loaded and processed
 * @property {React.Component|function} [Component=IconButton] - the component used to render the button
 * @property {string} [accept="image/*"] - the type of files to accept
 * @property {boolean} [multiple=false] - whether more than one file can be accepted
 * @property {FileCallback} [onFile] - a callback for when the file is loaded and processed
 */

/**
 * A button to upload an image
 * @param {ImageUploadButtonProps} props
 * @returns {JSX.Element}
 */
export function ImageUploadButton({
    children,
    maxWidth,
    maxHeight = 10000,
    onLoading = noop,
    onFile,
    onRaw,
    Component,
    accept = "image/*",
    multiple = false,
    ...props
}) {
    Component = Component || IconButton
    return (
        <Component className="uploadButton" {...props} onClick={prevent(click)}>
            {children}
        </Component>
    )

    function click() {
        const input = document.createElement("input")
        input.type = "file"
        delete input.capture
        input.accept = accept
        input.onchange = uploadFile
        input.multiple = multiple
        document.body.appendChild(input)
        input.click()
        document.body.removeChild(input)
    }

    async function uploadFile({ target: input }) {
        const { files } = input
        onLoading(true)
        for (const file of files) {
            let resized = await readAndCompressImage(file, {
                quality: 0.7,
                maxWidth,
                maxHeight,
                mimeType: file.type,
                autoRotate: true
            })
            if (onRaw) {
                onRaw(resized)
            } else {
                onFile(await fileToBase64(resized))
            }
        }
        input.value = ""
        onLoading(false)
    }
}
