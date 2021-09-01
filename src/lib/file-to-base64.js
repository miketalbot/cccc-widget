/**
 * Given a file, converts it into a data url
 * for the file
 * @param {File} blob
 * @returns {string} a base64 encoded version of the file
 */
export function fileToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        // When read send result to base64toBlob.
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject

        // Read the target as DataURL.
        reader.readAsDataURL(blob)
    })
}

/**
 * Encodes a url as an embedded data url in base64
 * @param {string} imageUrl - the url to the item to encode
 * @returns {string} a base64 encoded version of the contents of the supplied url
 */
export async function getBase64FromUrl(imageUrl) {
    const res = await fetch(imageUrl)
    const blob = await res.blob()

    return await fileToBase64(blob)
}
