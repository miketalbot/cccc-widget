import firebase from "firebase/app"
import { createContext, useContext, useEffect, useMemo } from "react"
import useAsync from "./useAsync"
import { useCurrentState } from "./useCurrentState"
import { useEvent } from "./useEvent"
import { useRefresh } from "./useRefresh"
import { db } from "./firebase"
import { showNotification } from "./notifications"
import { useRecord } from "./useRecord"
import { raise } from "./raise"

const auth = firebase.auth()

const UserContext = createContext(null)

export function User({ shouldBeCreator = false, children, fallback = null }) {
    const user = useUser({ shouldBeCreator })
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

    const additional = useAsync(
        async function () {
            if (!user) return {}
            const profile = await db
                .collection("userprofiles")
                .doc(user.uid)
                .get()
            if (profile.exists) {
                return profile.data()
            }
            return {}
        },
        {},
        user?.uid
    )
    const myUser = user?.isAnonymous && shouldBeCreator ? null : user
    const [score] = useRecord(db.collection("scores").doc(myUser?.uid), [
        myUser?.uid
    ])
    return useMemo(() => {
        const completeUser = myUser
            ? {
                  ...additional,
                  updateProfile: myUser.updateProfile.bind(myUser),
                  updatePassword: myUser.updatePassword.bind(myUser),
                  saveAdditional: async (data) => {
                      Object.assign(additional, data)
                      try {
                          await db
                              .collection("userprofiles")
                              .doc(user.uid)
                              .set(additional, { merge: true })
                      } catch (e) {
                          showNotification(e.message, { severity: "error" })
                      }
                      return additional
                  },
                  score: score?.score,
                  achievements: score?.achievements,
                  email: myUser.email,
                  uid: myUser.uid,
                  displayName: myUser.displayName,
                  photoURL: myUser.photoURL,
                  isAnonymous: myUser.isAnonymous,
                  signOut: () => {
                      localStorage.removeItem("signedIn")
                      return auth.signOut()
                  }
              }
            : null
        raise("user-updated", completeUser)
        return completeUser
    }, [myUser, score, additional, user?.uid])
}
