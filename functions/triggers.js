const functions = require("firebase-functions")
const admin = require("firebase-admin")
const sanitizeHtml = require("sanitize-html")

const db = admin.firestore()

module.exports = function (exports) {
    exports.createUser = functions.auth.user().onCreate(({ user }) => {
        if (!user) return
        db.collection("userprofiles").doc(user.uid).set(
            {
                displayName: user.displayName,
                photoURL: user.photoURL,
                email: user.email
            },
            { merge: true }
        )
    })
    exports.saveProfile = functions.firestore
        .document("userprofiles/{userId}")
        .onWrite(async (change) => {
            if (change.after.exists) {
                return change.after.ref.set(
                    {
                        description: sanitizeHtml(
                            change.after.data().description,
                            {
                                transformTags: {
                                    a: (tagName, attribs) => {
                                        return {
                                            tagName,
                                            attribs: {
                                                ...attribs,
                                                target: "_blank"
                                            }
                                        }
                                    }
                                }
                            }
                        )
                    },
                    { merge: true }
                )
            }
        })

    exports.createArticle = functions.firestore
        .document("userarticles/{userId}/articles/{articleId}")
        .onWrite(async (change, context) => {
            if (!change.after.exists) {
                const id = change.before.data().uid
                await db
                    .collection("responses")
                    .doc(id)
                    .set({ enabled: false }, { merge: true })
                await db
                    .collection("counts")
                    .doc(id)
                    .set({ enabled: false }, { merge: true })
                return
            }
            const data = change.after.data()
            sanitizeAll(data)
            data.comment = data.comment || false
            delete data.banned
            await change.after.ref.set(data)
            await db
                .collection("articles")
                .doc(data.uid)
                .set(data, { merge: true })
            const responseRef = db.collection("responses").doc(data.uid)
            const responseSnap = await responseRef.get()
            if (responseSnap.exists) {
                await responseRef.set(
                    {
                        processedTags: data.processedTags || [],
                        author: data.author,
                        enabled: data.enabled,
                        comment: data.comment || false
                    },
                    { merge: true }
                )
            } else {
                await responseRef.set({
                    types: [],
                    enabled: data.enabled,
                    created: Date.now(),
                    author: data.author,
                    comment: data.comment || false,
                    responses: {},
                    processedTags: data.processedTags || []
                })
            }

            const countRef = db.collection("counts").doc(data.uid)
            const countSnap = await countRef.get()
            if (countSnap.exists) {
                await countRef.set(
                    {
                        processedTags: data.processedTags || [],
                        author: data.author,
                        enabled: data.enabled,
                        comment: data.comment || false
                    },
                    { merge: true }
                )
            } else {
                await countRef.set({
                    enabled: data.enabled,
                    created: Date.now(),
                    author: data.author,
                    visits: 0,
                    comment: data.comment || false,
                    uniqueVisits: 0,
                    lastUniqueVisit: 0,
                    lastUniqueDay: 0,
                    recommends: 0,
                    clicks: 0,
                    processedTags: data.processedTags || []
                })
            }
        })
}

function sanitizeAll(value) {
    if (
        typeof value === "string" &&
        (value.includes("</") || value.includes("/>"))
    ) {
        return sanitizeHtml(value, {
            allowedAttributes: {
                span: ["style"],
                div: ["style"],
                p: ["style"],
                a: ["style", "href", "target"],
                img: ["src", "style"]
            },
            allowedTags: [
                "address",
                "article",
                "aside",
                "footer",
                "header",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "hgroup",
                "main",
                "nav",
                "section",
                "blockquote",
                "dd",
                "div",
                "dl",
                "dt",
                "figcaption",
                "figure",
                "hr",
                "li",
                "main",
                "ol",
                "p",
                "pre",
                "ul",
                "a",
                "abbr",
                "b",
                "bdi",
                "bdo",
                "br",
                "cite",
                "code",
                "data",
                "dfn",
                "em",
                "i",
                "img",
                "kbd",
                "mark",
                "q",
                "rb",
                "rp",
                "rt",
                "rtc",
                "ruby",
                "s",
                "samp",
                "small",
                "span",
                "strong",
                "sub",
                "sup",
                "time",
                "u",
                "var",
                "wbr",
                "caption",
                "col",
                "colgroup",
                "table",
                "tbody",
                "td",
                "tfoot",
                "th",
                "thead",
                "tr"
            ],
            allowedSchemes: ["http", "https", "data"],
            allowedStyles: {
                "*": {
                    // Match HEX and RGB
                    width: [/^\d+(?:px|em|%)$/],
                    height: [/^\d+(?:px|em|%)$/],
                    color: [
                        /^#(0x)?[0-9a-f]+$/i,
                        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
                    ],
                    background: [
                        /^url\([^)]+\)/i,
                        /^#(0x)?[0-9a-f]+$/i,
                        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
                    ],
                    "text-align": [/^left$/, /^right$/, /^center$/],
                    // Match any number with px, em, or %
                    "font-size": [/^\d+(?:px|em|%)$/],
                    "font-weight": [
                        /^(bold|bolder|light|regular|medium|[0..9]+)/i
                    ]
                }
            },
            transformTags: {
                a: (tagName, attribs) => {
                    return {
                        tagName,
                        attribs: {
                            ...attribs,
                            target: "_blank"
                        }
                    }
                }
            }
        })
    }
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            value[i] = sanitizeAll(value[i])
        }
    } else if (value && typeof value === "object") {
        for (let [prop, current] of Object.entries(value)) {
            value[prop] = sanitizeAll(current)
        }
    }
    return value
}
