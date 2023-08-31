import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

export default function ChatListItem (props) {
  const {
    chatData,
    otherUserData,
    truncatedMessage,
    isGroupChat,
    groupName,
    onLongPress,
    onPressOut,
    isSelected,
    selectedChatIds
  } = props

  const navigation = useNavigation()

  const handleNavigateToChat = () => {
    navigation.navigate('singleChat', {
      user: {
        _chatId: chatData?.key,
        uid: isGroupChat ? null : otherUserData?.uid,
        isGroupChat: isGroupChat,
        firstName: otherUserData?.firstName,
        about: isGroupChat ? null : otherUserData?.about,
        phone: isGroupChat ? null : otherUserData?.phone,
        photoURL: isGroupChat ? null : otherUserData?.profileImage
        // uids: isGroupChat ? chatData?.users : null
      }
    })
  }

  const handlePress = () => {
    if (selectedChatIds.length > 0) {
      if (!isSelected) {
        onLongPress(chatData?.key)
      } else {
        onPressOut(chatData?.key)
      }
    } else {
      handleNavigateToChat()
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`items-center justify-center bg-gray-100`}
      onLongPress={onLongPress}
    >
      <View
        className='flex flex-row items-center justify-between w-full p-4 border-b border-gray-200'
        style={{ backgroundColor: isSelected ? '#E5E7EB' : '#fff' }}
      >
        <View className='flex flex-row items-center w-3/4'>
          <View className='flex items-center justify-center w-12 h-12 mr-4 bg-gray-200 rounded-full'>
            {otherUserData?.profileImage ? (
              <Image
                source={{ uri: otherUserData?.profileImage }}
                className='w-10 h-10 rounded-full'
              />
            ) : isGroupChat ? (
              chatData?.groupImg ? (
                <Image
                  source={{ uri: chatData?.groupImg }}
                  className='w-10 h-10 rounded-full'
                />
              ) : (
                <Ionicons name='people' size={24} color='black' />
              )
            ) : (
              <Ionicons name='ios-person' size={24} color='black' />
            )}
          </View>
          <View className='flex flex-col max-w-xs'>
            <Text className='text-lg font-semibold capitalize'>
              {isGroupChat ? groupName : otherUserData?.firstLast}
            </Text>
            <Text className='text-sm text-gray-500 truncate w-56'>
              {truncatedMessage}
            </Text>
          </View>
        </View>
        <View className='flex flex-col items-end'>
          <Text className='text-sm text-gray-500'>
            {new Date(chatData?.updatedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
          </Text>
          <View className='flex items-center justify-center w-6 h-6 mt-2 rounded-full'>
            <Text className='text-xs font-bold text-white'></Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
