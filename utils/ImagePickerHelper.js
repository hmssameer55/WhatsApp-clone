import React from 'react'
import * as ImagePicker from 'expo-image-picker'
import { Alert } from 'react-native'
import { getDatabase, ref, set, update } from 'firebase/database'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'
import { FirebaseApp } from '../firebase/helper'
import uuid from 'react-native-uuid'

export const useImagePicker = async () => {
  await checkForPermissions('gallery')
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 6],
    quality: 1
  })
  if (!result.canceled) {
    return result.assets[0].uri
  } else {
    console.log('cancelled')
  }
}

export const useCamera = async () => {
  await checkForPermissions('camera')
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 4],
    quality: 1
  })
  if (!result.canceled) {
    return result.assets[0].uri
  } else {
    console.log('cancelled')
  }
}

const checkForPermissions = async permissionFor => {
  if (permissionFor === 'gallery') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!')
      Promise.reject('Permission not granted')
    }
    return Promise.resolve('Permission granted')
  } else if (permissionFor === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!')
      Promise.reject('Permission not granted')
    }
    return Promise.resolve('Permission granted')
  }
}

export const uploadImageToDB = async (uri, uid) => {
  const app = FirebaseApp()
  const response = await fetch(uri)
  const blob = await response.blob()
  const storage = getStorage(app)
  const storageRefUrl = storageRef(storage, `users/${uid}/profileImage`)
  await uploadBytes(storageRefUrl, blob)
  const downloadURL = await getDownloadURL(storageRefUrl)

  const db = getDatabase(app)
  const dbRef = ref(db, `users/${uid}`)
  await update(dbRef, { profileImage: downloadURL })
  return downloadURL
}

export const uploadImageToDBForGroup = async (uri, chatId) => {
  const app = FirebaseApp()
  const response = await fetch(uri)
  const blob = await response.blob()
  const storage = getStorage(app)
  const storageRefUrl = storageRef(storage, `groupImages/${chatId}`)
  await uploadBytes(storageRefUrl, blob)
  const downloadURL = await getDownloadURL(storageRefUrl)

  const db = getDatabase(app)
  const dbRef = ref(db, `chats/${chatId}`)
  await update(dbRef, { groupImg: downloadURL })
  return downloadURL
}

export const uploadImageToDBForChat = async (uri, chatId) => {
  try {
    const app = FirebaseApp()
    const response = await fetch(uri)
    const blob = await response.blob()
    const storage = getStorage(app)

    const storageRefUrl = storageRef(
      storage,
      `chatImages/${chatId}/${uuid.v4()}`
    )

    await uploadBytes(storageRefUrl, blob)
    const downloadURL = await getDownloadURL(storageRefUrl)
    return downloadURL
  } catch (err) {
    console.log(err)
  }
}
