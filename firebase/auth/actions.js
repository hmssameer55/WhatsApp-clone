import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { getDatabase, ref, set, child, get } from 'firebase/database'
import { FirebaseApp } from '../helper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getUserFromDB, saveUserToDB } from './userActions'
import { logout } from '../../store/redux/authSlice'

export const signup = async ({
  email,
  phone,
  password,
  firstName,
  lastName
}) => {
  const app = FirebaseApp()
  const auth = getAuth(app)

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user
    const userData = await saveUserToDB(
      firstName,
      lastName,
      email,
      phone,
      user.uid
    )

    const { uid, stsTokenManager } = user
    const { accessToken, expirationTime } = stsTokenManager

    await saveUserToLocalStorage(uid, accessToken, expirationTime)

    await savePushTokenToDB(userData)

    return { ...userData, token: accessToken }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const login = async ({ email, password }) => {
  const app = FirebaseApp()
  const auth = getAuth(app)
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    const { uid, stsTokenManager } = user

    const { accessToken, expirationTime } = stsTokenManager

    const userData = await getUserFromDB(uid)

    await saveUserToLocalStorage(uid, accessToken, expirationTime)

    await savePushTokenToDB(userData)

    return { ...userData, token: accessToken }
  } catch (error) {
    throw new Error(error.message)
  }
}

export const userLogout = userData => {
  return async dispatch => {
    await removePushTokenFromDB(userData)
    await AsyncStorage.removeItem('userData')
    dispatch(logout())
  }
}

const saveUserToLocalStorage = async (uid, token, expirationTime) => {
  try {
    await AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        uid,
        token,
        expirationTime
      })
    )
  } catch (error) {
    throw new Error(error.message)
  }
}

// When you make call from a browser .getIdToken(true) will automatically refresh your token. Make call like this:
export const refreshJwtToken = async () => {
  try {
    // Assuming you have the FirebaseApp function to initialize Firebase somewhere in your code
    const app = FirebaseApp()
    const auth = getAuth(app)
    const newToken = await auth.currentUser.getIdToken(true)
    // const { uid, stsTokenManager } = auth.currentUser
    // const { expirationTime } = stsTokenManager
    // await saveUserToLocalStorage(uid, newToken, expirationTime)
  } catch (error) {
    console.log('Error refreshing token:', error)
  }
}

export const savePushTokenToDB = async userData => {
  if (!Device.isDevice) return

  token = (await Notifications.getExpoPushTokenAsync()).data

  const tokenData = { ...userData.pushTokens } || {}

  const tokenArray = Object.values(tokenData)

  if (tokenArray.includes(token)) return

  tokenArray.push(token)

  for (let i = 0; i < tokenArray.length; i++) {
    const tok = tokenArray[i]
    tokenData[i] = tok
  }

  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  await set(child(dbRef, `users/${userData.uid}/pushTokens`), tokenData)

  return token
}

export const removePushTokenFromDB = async userData => {
  if (!Device.isDevice) return

  token = (await Notifications.getExpoPushTokenAsync()).data

  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  const snapshot = await get(child(dbRef, `users/${userData.uid}/pushTokens`))
  const tokenData = snapshot.val()

  if (!tokenData) return

  for (const key in tokenData) {
    if (tokenData[key] === token) {
      delete tokenData[key]
      break
    }
  }

  await set(child(dbRef, `users/${userData.uid}/pushTokens`), tokenData)
}
