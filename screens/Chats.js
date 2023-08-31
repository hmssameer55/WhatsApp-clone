import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native'
import { Ionicons, Feather, AntDesign, FontAwesome5 } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import truncateMessage from '../utils/truncateHelper'
import ChatListItem from '../components/Chats/ChatListItem'
import NoChats from '../components/Chats/NoChats'
import { deleteChats } from '../firebase/chat/chatActions'
import AwesomeAlert from 'react-native-awesome-alerts'
import CustomDeleteChatAlert from '../components/Chats/CustomDeleteChatAlert'

export default function Chats () {
  const navigation = useNavigation()
  const { userData } = useSelector(state => state.auth)
  const { userChats, chatUsers } = useSelector(state => state.userChats)
  //chatUsers mean all users data who are in chat with current user

  const { chatMessages } = useSelector(state => state.Messages)

  const [selectedChatIds, setSelectedChatIds] = useState([])
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return selectedChatIds.length > 0 ? (
          <TouchableOpacity
            className='mr-4'
            onPress={() => setShowDeleteAlert(true)}
          >
            <Feather name='trash-2' size={22} color='black' />
          </TouchableOpacity>
        ) : (
          <View className='flex flex-row'>
            <TouchableOpacity
              className='mr-4'
              onPress={() => navigation.navigate('newChat', { type: 'group' })}
            >
              <AntDesign name='addusergroup' size={24} color='black' />
            </TouchableOpacity>

            <TouchableOpacity
              className='mr-4'
              onPress={() => navigation.navigate('newChat', { type: 'single' })}
            >
              <Feather name='edit' size={22} color='black' />
            </TouchableOpacity>
          </View>
        )
      }
    })
  }, [selectedChatIds])

  const chatsListUserIds = useMemo(
    () =>
      Object.values(userChats).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      ),
    [userChats, chatUsers]
  )

  const messages = useMemo(() => {
    const formattedMessages = []

    Object.keys(chatMessages).forEach(chatId => {
      const chat = chatMessages[chatId]
      const chatMessagesArray = Object.values(chat)

      formattedMessages.push({
        chatId,
        messages: chatMessagesArray
      })
    })

    return formattedMessages
  }, [chatMessages])

  const findLastMessage = useCallback(
    chatId => {
      const lastMessage = messages
        .find(message => message.chatId === chatId)
        ?.messages?.slice(-1)[0]

      let truncatedMessage = truncateMessage(lastMessage?.text, 30)

      if (lastMessage?.image) {
        truncatedMessage = lastMessage.deletedForAll ? 'Image deleted' : 'Image'
      } else if (lastMessage?.deletedForAll) {
        truncatedMessage = 'Message deleted'
      } else if (lastMessage?.dontShow === userData.uid) {
        truncatedMessage = 'You deleted this message'
      }
      return truncatedMessage
    },
    [messages, userData.uid]
  )

  const handleChatLongPress = chatId => {
    setSelectedChatIds([...selectedChatIds, chatId])
  }

  const handleChatPressOut = chatId => {
    setSelectedChatIds(selectedChatIds.filter(id => id !== chatId))
  }

  const handleDeleteChats = async () => {
    try {
      const res = await deleteChats(selectedChatIds)
      setSelectedChatIds([])
    } catch (err) {
      console.log(err)
    } finally {
      setShowDeleteAlert(false)
    }
  }

  function validateDelete () {
    const createdByCurrentUser = chatId => {
      const chatData = userChats[chatId]
      return chatData && chatData.createdBy === userData.uid
    }

    if (selectedChatIds.every(chatId => createdByCurrentUser(chatId))) {
      return true
    } else {
      return false
    }
  }

  return (
    <View className='flex flex-1'>
      {chatsListUserIds.length > 0 ? (
        <FlatList
          data={chatsListUserIds}
          renderItem={({ item }) => {
            const chatData = item

            if (!chatData?.isGroupChat) {
              const otherUser = chatData?.users?.find(
                uid => uid !== userData.uid
              )
              const otherUserData = chatUsers.find(
                user => user.uid === otherUser
              )
              if (!otherUserData) return null
              let truncatedMessage = findLastMessage(chatData?.key)

              return (
                <ChatListItem
                  chatData={chatData}
                  otherUserData={otherUserData}
                  truncatedMessage={truncatedMessage}
                  onLongPress={() => handleChatLongPress(chatData?.key)}
                  onPressOut={() => handleChatPressOut(chatData?.key)}
                  isSelected={selectedChatIds.includes(chatData?.key)}
                  selectedChatIds={selectedChatIds}
                />
              )
            } else {
              let truncatedMessage = findLastMessage(chatData?.key)

              return (
                <ChatListItem
                  chatData={chatData}
                  otherUserData={chatData}
                  truncatedMessage={truncatedMessage}
                  isGroupChat={true}
                  groupName={chatData?.groupName}
                  onLongPress={() => handleChatLongPress(chatData?.key)}
                  onPressOut={() => handleChatPressOut(chatData?.key)}
                  isSelected={selectedChatIds.includes(chatData?.key)}
                  selectedChatIds={selectedChatIds}
                />
              )
            }
          }}
          keyExtractor={item => item.key}
        />
      ) : (
        <NoChats />
      )}

      <CustomDeleteChatAlert
        showDeleteAlert={showDeleteAlert}
        setShowDeleteAlert={setShowDeleteAlert}
        validateDelete={validateDelete}
        handleDeleteChats={handleDeleteChats}
      />
    </View>
  )
}
