import firebase from "firebase/app"
import { createContext, useContext, useEffect } from "react"
import { useCurrentState } from "./useCurrentState"
import { useEvent } from "./useEvent"
import { useRefresh } from "./useRefresh"

const auth = firebase.auth()

const UserContext = createContext(null)

export function User({ shouldBeCreator = false, children, fallback = null }) {
    const user = useUser({ shouldBeCreator })
    console.log("Set context", user?.displayName)
    return (
        <UserContext.Provider value={user}>
            {!!user ? children : fallback}
        </UserContext.Provider>
    )
}

export function useUserContext() {
    return useContext(UserContext)
}

export function useUser({ shouldBeCreator } = {}) {
    const refresh = useRefresh()
    useEvent("user-updated", () => {
        auth.currentUser && auth.currentUser.reload().then(refresh)
    })
    const context = useUserContext()
    const [user, setUser] = useCurrentState(() => {
        if (shouldBeCreator) {
            if (auth.currentUser && auth.currentUser.isAnonymous) return null
        }
        return auth.currentUser
    })
    const [startup, setStartup] = useCurrentState(false)

    useEffect(() => {
        setTimeout(
            () => setStartup(true),
            +(localStorage.getItem("signedIn") || 100)
        )
        return auth.onAuthStateChanged(setUser)
    }, [setStartup, setUser])

    useEffect(() => {
        if (!user && shouldBeCreator) return
        if (!user && startup && !context) {
            auth.signInAnonymously()
            localStorage.setItem("signedIn", 1000)
        } else if (user) {
            localStorage.setItem("signedIn", 1000)
        }
    }, [user, shouldBeCreator, startup, context])

    const myUser = user?.isAnonymous && shouldBeCreator ? null : user
    return myUser
        ? {
              updateProfile: myUser.updateProfile.bind(myUser),
              updatePassword: myUser.updatePassword.bind(myUser),
              email: myUser.email,
              uid: myUser.uid,
              displayName: myUser.displayName,
              photoURL: myUser.photoURL,
              isAnonymous: myUser.isAnonymous
          }
        : null
}