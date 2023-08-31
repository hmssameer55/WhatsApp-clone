import {
  getDatabase,
  ref,
  set,
  child,
  get,
  update,
  query,
  orderByChild,
  startAt,
  endAt,
  equalTo
} from 'firebase/database'
import { FirebaseApp } from '../helper'

export const getUserFromDB = async uid => {
  try {
    const app = FirebaseApp()
    const dbRef = ref(getDatabase(app))
    const userRef = child(dbRef, `users/${uid}`)
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    throw new Error(error.message)
  }
}

export const saveUserToDB = async (firstName, lastName, email, phone, uid) => {
  const firstLast = `${firstName} ${lastName}`.toLowerCase()
  const userData = {
    firstName,
    lastName,
    email,
    phone,
    firstLast,
    uid,
    createdAt: new Date().toISOString()
  }
  const dbRef = ref(getDatabase())
  const childRef = child(dbRef, `users/${uid}`)
  try {
    await set(childRef, userData)
    return userData
  } catch (error) {
    throw new Error(error.message)
  }
}

export const updateUserInfoInDB = async (firstName, lastName, about, uid) => {
  const app = FirebaseApp()
  const firstLast = `${firstName} ${lastName}`.toLowerCase()
  const userData = {
    firstName,
    lastName,
    about,
    firstLast,
    uid,
    updatedAt: new Date().toISOString()
  }
  const dbRef = ref(getDatabase(app))
  const childRef = child(dbRef, `users/${uid}`)
  try {
    await update(childRef, userData)
    return userData
  } catch (error) {
    throw new Error(error.message)
  }
}

export const searchUsersInDB = async searchNumber => {
  //to be clear searchNumber will be the phone number of the user that is being searched for

  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))
  const usersRef = child(dbRef, 'users')

  try {
    const queryRef = query(
      usersRef,
      orderByChild('phone'),
      equalTo(searchNumber) // Use 'equalTo' to get an exact match
    )

    const snapshot = await get(queryRef)
    if (snapshot.exists()) {
      return snapshot.val()
    }

    return {}
  } catch (error) {
    throw new Error(error.message)
  }
}
