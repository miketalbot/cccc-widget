const functions = require("firebase-functions")
const admin = require("firebase-admin")
const sanitizeHtml = require("sanitize-html")

const db = admin.firestore()

module.exports = function (exports) {
    exports.createUser = functions.auth.user().onCreate(({ user }) => {
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
