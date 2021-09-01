import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"
import "firebase/storage"
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
export { app, db }
