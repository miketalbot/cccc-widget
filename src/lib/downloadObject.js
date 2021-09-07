/**
 * Downloads a file of a JSON stringified object
 * to the user
 * @param {RecordType} object - an object to be downloaded
 * @param {string} [filename="file.json"] - the name of the file to download
 */

export function downloadObject(object, filename = "file.json") {
    var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(object))
    var dlAnchorElem = document.createElement("a")
    dlAnchorElem.setAttribute("href", dataStr)
    dlAnchorElem.setAttribute("download", filename)
    dlAnchorElem.click()
}
