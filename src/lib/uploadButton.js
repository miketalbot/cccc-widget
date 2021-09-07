import { readAndCompressImage } from "browser-image-resizer"

import { Box, Button, IconButton, makeStyles } from "@material-ui/core"

import { fileToBase64 } from "./file-to-base64"
import { useRef } from "react"

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

const useStyles = makeStyles({
    uploadButton: {
        width: 0,
        height: 0,
        display: "none",
        position: "absolute"
    }
})

/**
 * @callback JSONFileCallback
 * @param {RecordType} parsedData
 */

/**
 * @callback BlobFileCallback
 * @param {Blob} file - the file that has been loaded
 */

/**
 * @callback BlobFilesCallback
 * @param {Blob[]} files - the files which have been loaded
 */

/**
 * @class UploadButtonProps
 * @implements RecordType
 * @property {NotificationFunction} [onLoading] - a callback for when the image is being loaded and processed
 * @property {React.Component|function} [Component=Button] - the component used to render the button
 * @property {string} [accept="*"] - the type of files to accept
 * @property {boolean} [multiple=false] - whether more than one file can be accepted
 * @property {JSONFileCallback} [onFile] - a callback for when the file is loaded and parsed as JSON, if multiple files it is called for each of them
 * @property {BlobFileCallback} [onRaw] - a callback for when the file is loaded, if multiple files then it is called for each of them
 * @property {BlobFilesCallback} [onRawFiles] - a callback for all of the files that have been loaded before any processing
 *
 */

/**
 * A button that allows for the generic upload
 * of files to the browser
 * @param {UploadButtonProps} [props]
 * @returns {JSX.Element}
 */
export function UploadButton({
    onFile = noop,
    onRawFiles = noop,
    onRaw = noop,
    Component = Button,
    accept = "*",
    children,
    multiple,
    ...props
}) {
    const classes = useStyles()
    const inputHolder = useRef()
    const fileInput = useRef()

    return (
        <>
            <Component {...props} onClick={prevent(selectFile)}>
                {children}
            </Component>
            <Box
                className="upload-button-input"
                ref={inputHolder}
                style={{
                    width: 0,
                    height: 0,
                    display: "none",
                    position: "absolute"
                }}
            >
                <input
                    ref={fileInput}
                    className={`file-input ${classes.uploadButton}`}
                    onChange={gotFile}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                />
            </Box>
        </>
    )

    async function gotFile(e) {
        const { target: { files = [] } = {} } = e
        if (await onRawFiles(files, accept)) {
            return
        }
        for (let file of files) {
            if (await onRaw(file, accept, files.length)) {
                continue
            }
            if (file) {
                const reader = new FileReader()

                reader.onload = (e) => {
                    let file = e.target.result
                    try {
                        file = JSON.parse(file)
                    } catch (e) {
                        // Wasn't JSON
                    }
                    onFile(file)
                }
                reader.readAsText(file, "utf8")
            }
        }
        clearInputFile(fileInput.current)
    }

    function selectFile() {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = multiple
        input.accept = accept
        input.style.display = "none"
        input.onchange = gotFile
        document.body.appendChild(input)
        setTimeout(() => {
            input.click()
            input.value = ""
        }, 200)
    }

    function clearInputFile(f) {
        if (!f) return
        f.value = ""
        // For older browsers if above doesn't work
        if (f.value) {
            f.type = "text"
            f.type = "file"
        }
    }
}
