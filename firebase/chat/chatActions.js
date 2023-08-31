import { FirebaseApp } from '../helper'
import {
  ref,
  getDatabase,
  push,
  set,
  child,
  get,
  onValue,
  update,
  remove
} from 'firebase/database'

export const createChat = async (loggedInUserId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))
  const newChatRef = await push(child(dbRef, 'chats'), newChatData)

  const chatUsers = chatData.users
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i]
    await push(child(dbRef, `userChats/${userId}`), newChatRef.key)
  }

  return newChatRef.key
}

export const sendTextMessage = async (
  chatId,
  senderData,
  textMessage,
  replyTo,
  chatUsers
) => {
  await sendMessage(chatId, senderData.uid, textMessage, null, replyTo)

  otherUsers = chatUsers.filter(uid => uid !== senderData.uid)

  // await sendPushNotification(
  //   otherUsers,
  //   senderData.firstName,
  //   textMessage,
  //   chatId
  // )
}

export const sendImageMessage = async (chatId, senderId, imageMsg, replyTo) => {
  await sendMessage(chatId, senderId, null, imageMsg, replyTo)
}

export const sendMessage = async (
  chatId,
  senderId,
  textMessage,
  imageMsg,
  replyTo
) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  const newMessageData = {
    text: textMessage,
    sendBy: senderId,
    sendAt: new Date().toISOString()
  }

  if (replyTo) {
    newMessageData.replyTo = replyTo
  }

  if (imageMsg) {
    newMessageData.image = imageMsg
  }

  await push(child(dbRef, `messages/${chatId}`), newMessageData)

  await update(child(dbRef, `chats/${chatId}`), {
    updatedAt: new Date().toISOString(),
    updatedBy: senderId,
    lastMessage: textMessage
  })
}

export const deleteMessages = async (
  chatId,
  selectedMessageIds,
  userId,
  meOrOther
) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  for (let i = 0; i < selectedMessageIds.length; i++) {
    const messageId = selectedMessageIds[i]
    const messageRef = child(dbRef, `messages/${chatId}/${messageId}`)
    const messageSnapshot = await get(messageRef)

    if (messageSnapshot.exists()) {
      const existingMessage = messageSnapshot.val()
      const updateData = {}

      if (meOrOther === 'me') {
        ;(updateData.deletedForAll = true),
          (updateData.deletedBy = userId),
          (updateData.deletedByMeAt = new Date().toISOString())
      } else {
        updateData.dontShow = userId
      }

      // Merge the existing message data with the update data
      const updatedMessage = {
        ...existingMessage,
        ...updateData
      }
      // Update the message with the merged data
      await set(messageRef, updatedMessage)
    }
  }

  return true
}

export const updateGroupName = async (chatId, name, userId) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  await update(child(dbRef, `chats/${chatId}`), {
    groupName: name,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  })

  return true
}

export const getUserChats = async userId => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  try {
    const userChatsRef = child(dbRef, `userChats/${userId}`)
    const snapshot = await get(userChatsRef)
    return snapshot.val()
  } catch (err) {
    console.log(err)
  }
}

export const deleteUserChats = async (userId, key) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  const userChatRef = child(dbRef, `userChats/${userId}/${key}`)

  await remove(userChatRef)

  return true
}

export const addUserToChat = async (chatId, uids, loggedInUserId) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))
  const chatRef = child(dbRef, `chats/${chatId}`)
  const snapshot = await get(chatRef)
  const chat = snapshot.val()

  const updatedUsers = [...chat.users, ...uids]

  let uniqueUsers = [...new Set(updatedUsers)]

  await update(chatRef, {
    updatedAt: new Date().toISOString(),
    updatedBy: loggedInUserId,
    users: uniqueUsers
  })

  for (let i = 0; i < uniqueUsers.length; i++) {
    const userId = uniqueUsers[i]
    const userChatsRef = child(dbRef, `userChats/${userId}`)
    const userChatsSnapshot = await get(userChatsRef)
    const userChats = userChatsSnapshot.val()

    if (!userChats || !Object.values(userChats).includes(chatId)) {
      await push(userChatsRef, chatId)
    }
  }
}

export const removeMember = async (
  chatId,
  userId,
  loggedInUserId,
  updatedUsers
) => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))
  const chatRef = child(dbRef, `chats/${chatId}`)

  await update(chatRef, {
    updatedAt: new Date().toISOString(),
    updatedBy: loggedInUserId,
    users: updatedUsers
  })

  const userChats = await getUserChats(userId)

  const userChatKey = Object.keys(userChats).find(
    key => userChats[key] === chatId
  )

  await deleteUserChats(userId, userChatKey)

  return true
}

export const deleteChats = async chatIds => {
  const app = FirebaseApp()
  const dbRef = ref(getDatabase(app))

  const users = []

  for (let i = 0; i < chatIds.length; i++) {
    const chatId = chatIds[i]
    const chatRef = child(dbRef, `chats/${chatId}`)
    const snapshot = await get(chatRef)
    const chat = snapshot.val()
    users.push(...chat.users)
  }

  const uniqueUsers = [...new Set(users)]

  for (let i = 0; i < uniqueUsers.length; i++) {
    const userId = uniqueUsers[i]
    const userChatsRef = child(dbRef, `userChats/${userId}`)
    const snapshot = await get(userChatsRef)
    const userChats = snapshot.val()

    for (let j = 0; j < chatIds.length; j++) {
      const chatId = chatIds[j]
      const userChatKey = Object.keys(userChats).find(
        key => userChats[key] === chatId
      )

      if (userChatKey) {
        await deleteUserChats(userId, userChatKey)
      }
    }
  }

  // for (let i = 0; i < chatIds.length; i++) {
  //   const chatId = chatIds[i]
  //   const chatRef = child(dbRef, `chats/${chatId}`)
  //   await remove(chatRef)
  // }
}

export const sendPushNotification = async (
  otherUsers,
  senderName,
  body,
  chatId
) => {
  otherUsers?.forEach(async uid => {
    const app = FirebaseApp()
    const dbRef = ref(getDatabase(app))
    const snapshot = await get(child(dbRef, `users/${uid}`))
    const userData = snapshot.val()

    if (userData.pushTokens) {
      const tokenArray = Object.values(userData.pushTokens)
      tokenArray.forEach(async token => {
        const message = {
          to: token,
          sound: 'default',
          title: senderName,
          body: body,
          data: { data: chatId },
          _displayInForeground: true
        }
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        })
      })
    }
  })
}
