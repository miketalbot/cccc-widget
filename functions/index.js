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
    const countRef = db.collection("counts").doc(articleId)
    const doc = await countRef.get()
    const data = doc.exists ? doc.data() : {}
    const users = (data.users = data.users || {})
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24))

    if (!users[context.auth.uid]) {
        if (data.author !== context.auth.uid) {
            await awardPoints(data.author, 20, "New Unique Reader")
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
        data.lastUniqueDay = day
        data.firstUniqueDay = data.firstUniqueDay || day
        for (let tag of data.processedTags || []) {
            await incrementTag(tag, "uniqueVisits")
        }
        await incrementTag(shard, "uniqueVisits")
    }
    await countRef.collection("visits").add({
        uid: context.auth.uid,
        time: Date.now()
    })
    data.visits = (data.visits || 0) + 1
    data.responses = data.responses || {}
    await countRef.set(data)
    for (let tag of data.processedTags || []) {
        await incrementTag(tag, "visits")
    }
    await incrementTag(shard, "visits")
    await awardPoints(context.auth.uid, 1, "Viewed an article")
    return null
})

async function incrementTag(tag, value, amount = 1, options = {}) {
    const tagRef = db.collection("tags").doc(tag)
    const tagDoc = await tagRef.get()
    const tagData = tagDoc.exists
        ? tagDoc.data()
        : {
              ...options,
              tag,
              special: tag.startsWith("__"),
              event: tag.startsWith("__event_")
          }
    tagData[value] = (tagData[value] || 0) + amount
    await tagRef.set(tagData)
}

exports.recordEvent = functions.https.onCall(
    async ({ event, articleId }, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        if (!context.auth.uid) return null
        if (
            await decorateArticle(articleId, async () => {
                await incrementTag(
                    `__event_${articleId}_event_${event}`,
                    "count",
                    1,
                    {
                        articleId,
                        type: "event",
                        event
                    }
                )
            })
        ) {
            await incrementTag(`__event_${event}`, "count")
        }
    }
)

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
        data.responseCount = (data.responseCount || 0) + 1
        await db
            .collection("counts")
            .doc(articleId)
            .set({ responseCount: data.responseCount }, { merge: true })

        await responseRef.set(data)
        return null
    }
)

exports.addAchievement = functions.https.onCall(
    async ({ points = 10, achievement, articleId }, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        points = Math.min(points, 50)
        if (!achievement) return
        if (
            await decorateArticle(articleId, () => {
                incrementTag(
                    `__event_${articleId}_achievement_${achievement}`,
                    "count",
                    1,
                    {
                        articleId,
                        achievement,
                        type: "achievement"
                    }
                )
            })
        ) {
            await incrementTag(`__event_${achievement}`, "count")
            const userUid = context.auth.uid
            const scoreRef = db.collection("scores").doc(userUid)
            const snap = await scoreRef.get()
            const data = snap.exists ? snap.data() : {}
            data.achievements = data.achievements || {}
            if (!data.achievements[achievement]) {
                data.score = (data.score || 0) + points
                data.achievements[achievement] = Date.now()
                await scoreRef.set(data)
            }
        }
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
            .collection("counts")
            .where("enabled", "==", true)
            .where("comment", "!=", true)
            .orderBy("comment", "desc")
            .orderBy("firstUniqueDay", "desc")
            .orderBy("lastUniqueDay", "desc")
            .orderBy("visits", "desc")
            .limit(number * 2)
            .get()
        rowSnap.forEach((row) => {
            let record = row.data()
            if (row.id === articleId) return
            let score = record.processedTags.reduce(
                (a, c) => (tags.has(c) ? a + 1 : a),
                0
            )
            rows.push({ id: row.id, score })
        })
        rows.sort((a, b) => b.score - a.score)
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
        if (response) {
            await awardPoints(context.auth.uid, 100, "Interacted With Article")
            await awardPoints(article.author, 20, "Gained an interaction")
        }
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
        data.responseCount = (data.responseCount || 0) + 1
        await db
            .collection("counts")
            .doc(articleId)
            .set({ responseCount: data.responseCount }, { merge: true })
        await responseRef.set(data)
        return null
    }
)

async function decorateArticle(articleId, cb) {
    if (!articleId) return false
    const articleRef = db.collection("articles").doc(articleId)
    const article = (await articleRef.get()).data() || {}
    if (!article.enabled || article.banned) return false
    if (cb) {
        if (await cb(article)) {
            await articleRef.set(article, { merge: true })
        }
    }
    return true
}

exports.awardPoints = functions.https.onCall(
    async ({ points = 1, achievement, articleId }, context) => {
        points = Math.max(0, Math.min(points, 20))
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "The function must be called from an App Check verified app."
            )
        }
        if (!context.auth.uid) return
        if (
            await decorateArticle(articleId, () => {
                incrementTag(`__event_${articleId}_points`, "points", points, {
                    articleId,
                    type: "points"
                })
            })
        ) {
            await awardPoints(context.auth.uid, points, achievement)
        }
        return null
    }
)

exports.wasClicked = functions.https.onCall(async ({ articleId }, context) => {
    if (context.app === undefined) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called from an App Check verified app."
        )
    }
    const countRef = db.collection("counts").doc(articleId)
    const doc = await countRef.get()
    const data = doc.exists ? doc.data() : {}
    data.clicks = (data.clicks || 0) + 1
    await countRef.set(data)
    await countRef.collection("clicks").add({
        uid: context.auth.uid,
        time: Date.now()
    })
})

async function awardPoints(
    userUid,
    points = 1,
    achievement,
    bonus = () => [0]
) {
    if (!userUid) return
    points = Math.max(0, points)
    const scoreRef = db.collection("scores").doc(userUid)
    const snap = await scoreRef.get()
    const data = snap.exists ? snap.data() : {}
    if ((data.coolOff || Date.now()) > Date.now()) return
    const times = (data.eventTimes = data.eventTimes || [])
    times.push(Date.now())
    if (times.length > 10) {
        let total = 0
        for (let i = 1; i < times.length; i++) {
            total += times[i] - times[i - 1]
        }
        const average = total / times.length
        if (average < 15000) {
            data.errorCount = (data.errorCount || 0) + 1
            if (data.errorCount > 20) {
                data.coolOff = Date.now() + 1000 * 60 * 60
            }
        } else {
            data.errorCount = Math.max(0, (data.errorCount || 0) - 1)
        }
        if (average < 1000) {
            data.coolOff = Math.max(data.coolOff, Date.now() + 1000 * 60 * 5)
        }
        if (average < 5000) {
            return
        }
        data.eventTimes = times.slice(-20)
    }
    data.achievements = data.achievements || {}
    const [extra = 0, extraAchievement] = bonus(data, points, achievement) || []
    data.score = (data.score || 0) + points + extra
    if (achievement) {
        data.achievements[achievement] = Date.now()
        await incrementTag(`__event_${achievement}`, "count")
    }
    if (extraAchievement) {
        data.achievements[extraAchievement] = Date.now()
    }
    await scoreRef.set(data)
}
