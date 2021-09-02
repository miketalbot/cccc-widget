const functions = require("firebase-functions")
const admin = require("firebase-admin")
const sanitizeHtml = require("sanitize-html")

const db = admin.firestore()

module.exports = function (exports) {
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
                await db.collection("articles").doc(id).delete()
                return
            }
            const data = change.after.data()
            await db
                .collection("articles")
                .doc(data.uid)
                .set(data, { merge: true })
            const responseRef = db.collection("responses").doc(data.uid)
            const responseSnap = await responseRef.get()
            if (responseSnap.exists) {
                await responseRef.set(
                    {
                        processedTags: data.processedTags || []
                    },
                    { merge: true }
                )
                return
            }
            await responseRef.set({
                created: Date.now(),
                visits: 0,
                uniqueVisits: 0,
                lastUniqueVisit: 0,
                lastUniqueDay: 0,
                responses: {},
                visitTimes: [],
                processedTags: data.processedTags || []
            })
        })
}
