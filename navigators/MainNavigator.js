import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import SingleChatScreen from '../screens/SingleChatScreen'
import NewChatScreen from '../screens/NewChatScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import { useSelector, useDispatch } from 'react-redux'
import {
  getDatabase,
  ref,
  off,
  push,
  child,
  onValue,
  get
} from 'firebase/database'
import { FirebaseApp } from '../firebase/helper'
import { setUserChats, setChatUsers } from '../store/redux/chatSlice'
import { setIsLoading } from '../store/redux/userDataSlice'
import { setChatMessages } from '../store/redux/MessagesSlice'
import UserProfile from '../screens/UserProfile'

export default function MainNavigator () {
  const Stack = createNativeStackNavigator()
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(true)

  const [expoPushToken, setExpoPushToken] = useState('')
  const [notification, setNotification] = useState(false)
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token))

    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification)
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response)
      })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  useEffect(() => {
    const app = FirebaseApp()
    const dbRef = ref(getDatabase(app))
    const userChatsRef = child(dbRef, `userChats/${userData.uid}`)
    const refs = [userChatsRef]

    onValue(userChatsRef, snapshot => {
      const chatIdsData = snapshot.val() || {}
      const chatIds = Object.values(chatIdsData)

      const chatsData = {}
      let chatsFoundCount = 0

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i]
        const chatRef = child(dbRef, `chats/${chatId}`)
        refs.push(chatRef)

        onValue(chatRef, snapshot => {
          chatsFoundCount++
          const chatData = snapshot.val()

          if (chatData) {
            if (!chatData.users.includes(userData.uid)) {
              return
            }

            chatData.key = snapshot.key

            chatData?.users.forEach(uid => {
              if (uid === userData.uid) return
              const userRef = child(dbRef, `users/${uid}`)
              get(userRef).then(snapshot => {
                const chatUserData = snapshot.val()
                if (chatUserData) {
                  // console.log('chatUserData: ', chatUserData)
                  dispatch(setChatUsers(chatUserData))
                }
              })
              refs.push(userRef)
            })

            chatsData[snapshot.key] = chatData
          }

          if (chatsFoundCount >= chatIds.length) {
            dispatch(setUserChats(chatsData))
            setIsLoading(false)
          }
        })

        const messagesRef = child(dbRef, `messages/${chatId}`)
        refs.push(messagesRef)

        onValue(messagesRef, snapshot => {
          const messagesData = snapshot.val() || {}
          dispatch(setChatMessages({ chatId, messagesData }))
        })
      }

      if (chatsFoundCount === 0) {
        dispatch(setUserChats({}))
        setIsLoading(false)
      }
    })

    return () => {
      console.log('unsubscribing from chats')
      refs.forEach(ref => off(ref))
    }
  }, [])

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size='large' color='#000' />
      </View>
    )
  }

  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          options={{
            headerShown: false
          }}
          name='Home'
          component={TabNavigator}
        />
        <Stack.Screen name='singleChat' component={SingleChatScreen} />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'containedModal',
          animation: 'slide_from_bottom',
          animationDuration: 300
        }}
      >
        <Stack.Screen
          options={{
            headerTitle: 'New Chat'
            // headerBackVisible: false
          }}
          name='newChat'
          component={NewChatScreen}
        />
        <Stack.Screen name='userProfile' component={UserProfile} />
      </Stack.Group>
    </Stack.Navigator>
  )
}

async function registerForPushNotificationsAsync () {
  let token

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: '9f4924ec-a5da-4437-a439-4e6569f9803d'
      })
    ).data
  } else {
    alert('Must use physical device for Push Notifications')
  }

  return token
}
