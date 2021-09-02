import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import "firebase/app-check"
import "firebase/storage"
import "firebase/functions"
const firebaseConfig = {
    apiKey: "AIzaSyDXQLOODKydIvotlIcucAcKoPSttFYN06U",
    authDomain: "cccc-widget.firebaseapp.com",
    projectId: "cccc-widget",
    storageBucket: "cccc-widget.appspot.com",
    messagingSenderId: "161601216755",
    appId: "1:161601216755:web:1fedfd381420e207a79786",
    measurementId: "G-PTJX5ZRGPD"
}
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
export default app

function define(name, ...params) {
    const fn = firebase.functions().httpsCallable(name)
    return async function (...callWith) {
        const param = {}
        for (let i = 0; i < callWith.length; i++) {
            if (params[i]) {
                param[params[i]] = callWith[i]
            }
        }
        return (await fn(param))?.data
    }
}

const view = define("view", "articleId")
const respond = define("respond", "articleId", "type", "respond")
const respondUnique = define("respond", "articleId", "type", "respondUnique")
const recommend = define("recommend", "articleId", "number")
const awardPoints = define("awardPoints", "points", "achievement")

export {
    firebase,
    app,
    db,
    view,
    respond,
    respondUnique,
    recommend,
    awardPoints
}
