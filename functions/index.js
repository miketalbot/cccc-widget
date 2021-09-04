const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()
const db = admin.firestore()
require("./triggers")(exports, db)

exports.view = functions.https.onCall(async ({ articleId }, context) => {
    if (context.app === undefined) {
        console.error("Not validated")
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called from an App Check verified app."
        )
    }
    if (!context.auth.uid) {
        console.error("No user")
        return null
    }
    const shard = `__all__${Math.floor(Math.random() * 20)}`
    const article =
        (await db.collection("articles").doc(articleId).get()).data() || {}
    const responseRef = db.collection("responses").doc(articleId)
    const doc = await responseRef.get()
    const data = doc.exists ? doc.data() : {}
    const users = (data.users = data.users || {})
    if (!users[context.auth.uid]) {
        if (article.author !== context.auth.uid) {
            await awardPoints(article.author, 20, "New Unique Reader")
        }
        await awardPoints(
            context.auth.uid,
            50,
            "Read New Article",
            ({ achievements }) => {
                if (!achievements["Read New Article"]) {
                    return [100, "Read First Article"]
                }
            }
        )
        users[context.auth.uid] = Date.now()
        data.uniqueVisits = (data.uniqueVisits || 0) + 1
        data.lastUniqueVisit = Date.now()
        data.lastUniqueDay = Math.floor((Date.now() / 1000) * 60 * 60 * 24)
        for (let tag of article.processedTags || []) {
            await incrementTag(tag, "uniqueVisits")
        }
        await incrementTag(shard, "uniqueVisits")
    }
    await responseRef.collection("visits").add({
        uid: context.auth.uid,
        time: Date.now()
    })
    data.visits = (data.visits || 0) + 1
    data.responses = data.responses || {}
    await responseRef.set(data)
    for (let tag of article.processedTags || []) {
        await incrementTag(tag, "visits")
    }
    await incrementTag(shard, "visits")
    await awardPoints(context.auth.uid, 1, "Viewed an article")
    return null
})

async function incrementTag(tag, value) {
    const tagRef = db.collection("tags").doc(tag)
    const tagDoc = await tagRef.get()
    const tagData = tagDoc.exists
        ? tagDoc.data()
        : { tag, special: tag.startsWith("__") }
    tagData[value] = (tagData[value] || 0) + 1
    await tagRef.set(tagData)
}

exports.respond = functions.https.onCall(
    async ({ articleId, type = "general", response }, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        if (!context.auth.uid) return null
        const article =
            (await db.collection("articles").doc(articleId).get()).data() || {}
        await awardPoints(context.auth.uid, 100, "Interacted With Article")
        await awardPoints(article.author, 20, "Gained an interaction")
        const responseRef = db.collection("responses").doc(articleId)
        const doc = await responseRef.get()
        const data = doc.exists ? doc.data() : {}
        data.types = data.types || []
        if (!data.types.includes(type)) {
            data.types.push(type)
        }

        const responseCollections = (data.responses = data.responses || {})
        const responses = (responseCollections[type] =
            responseCollections[type] || {})
        const list = (responses[context.auth.uid] =
            responses[context.auth.uid] || [])
        list.push(response)
        await responseRef.set(data)
        return null
    }
)

exports.recommend = functions.https.onCall(
    async ({ articleId, number = 10 }, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        const articleSnap = await db.collection("articles").doc(articleId).get()
        const tags = articleSnap.exists
            ? new Set(articleSnap.data().processedTags)
            : new Set()
        const rows = []
        const rowSnap = await db
            .collection("responses")
            .where("comment", "!=", true)
            .orderBy("comment", "desc")
            .orderBy("lastUniqueDay", "desc")
            .orderBy("visits", "desc")
            .limit(number * 4)
            .get()
        rowSnap.forEach((row) => {
            let record = row.data()
            let score = record.processedTags.reduce(
                (a, c) => (tags.has(c) ? a + 1 : a),
                0
            )
            rows.push({ id: row.id, score })
        })
        rows.sort((a, b) => b.score - a.score).filter((r) => r.id !== articleId)
        return rows.slice(0, number).map((r) => r.id)
    }
)

exports.respondUnique = functions.https.onCall(
    async ({ articleId, type = "general", response }, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        if (!context.auth.uid) return null
        const article =
            (await db.collection("articles").doc(articleId).get()).data() || {}
        await awardPoints(context.auth.uid, 100, "Interacted With Article")
        await awardPoints(article.author, 20, "Gained an interaction")
        const responseRef = db.collection("responses").doc(articleId)
        const doc = await responseRef.get()
        const data = doc.exists ? doc.data() : {}
        data.types = data.types || []
        if (!data.types.includes(type)) {
            data.types.push(type)
        }
        const responseCollections = (data.responses = data.responses || {})
        const responses = (responseCollections[type] =
            responseCollections[type] || {})
        responses[context.auth.uid] = response
        await responseRef.set(data)
        return null
    }
)

exports.awardPoints = functions.https.onCall(
    async ({ points = 1, achievement = "Plugin Award" }, context) => {
        points = Math.max(0, Math.min(points, 20))
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        if (!context.auth.uid) return
        await awardPoints(context.auth.uid, points, achievement)
        return null
    }
)

async function awardPoints(
    userUid,
    points = 1,
    achievement = "notSpecified",
    bonus = () => [0]
) {
    if (!userUid) return
    points = Math.max(0, points)
    const scoreRef = db.collection("scores").doc(userUid)
    const snap = await scoreRef.get()
    const data = snap.exists ? snap.data() : {}
    data.achievements = data.achievements || {}
    const [extra = 0, extraAchievement] = bonus(data, points, achievement) || []
    data.score = (data.score || 0) + points + extra
    data.achievements[achievement] = Date.now()
    if (extraAchievement) {
        data.achievements[extraAchievement] = Date.now()
    }
    await scoreRef.set(data)
}
