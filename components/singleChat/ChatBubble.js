import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import { format } from 'date-fns'
import ChatBubbleImage from './ChatBubbleImage'
import ImageView from 'react-native-image-viewing'

const ChatBubble = ({
  message,
  dontShowForAll,
  image,
  messageId,
  timeStamp,
  isSentByMe,
  onLongPress,
  onPressOut,
  isSelected,
  selectedMessageIds,
  replyMessage,
  otherUserFirstName,
  selectedImage,
  setSelectedImage,
  isGroupChat,
  sendBy
}) => {
  const { userData } = useSelector(state => state.auth)

  const { chatUsers } = useSelector(state => state.userChats)

  const handleLongPress = () => {
    if (!dontShowForAll) {
      onLongPress(messageId)
    }
  }

  const handlePressOut = () => {
    if (!dontShowForAll) {
      onPressOut(messageId)
    }
  }

  const handlePress = () => {
    if (!dontShowForAll) {
      if (image && !isSelected && selectedMessageIds.length === 0) {
        setSelectedImage(image)
      } else {
        !isSelected && selectedMessageIds.length > 0
          ? handleLongPress()
          : handlePressOut()
      }
    }
  }

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        className={`${
          isSentByMe ? 'flex-row-reverse' : 'flex-row'
        }  items-center mb-1.5 p-1 rounded-lg 
       ${isSelected ? 'bg-gray-300' : 'bg-transparent'}
      `}
      >
        {!isSentByMe && isGroupChat && (
          <View className='flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-blue-500'>
            {chatUsers.find(user => user.uid === sendBy)?.profileImage ? (
              <Image
                source={{
                  uri: chatUsers.find(user => user.uid === sendBy)?.profileImage
                }}
                style={{ width: 30, height: 30, borderRadius: 50 }}
              />
            ) : (
              <Feather name='user' size={16} color='#fff' />
            )}
          </View>
        )}

        <View
          className={`${
            isSentByMe ? 'bg-cyan-700' : 'bg-gray-200'
          } px-2 py-1.5 rounded-lg w-fit max-w-[80%] relative ${
            isSelected ? 'opacity-75' : 'opacity-100'
          } `}
        >
          {replyMessage && (
            <View className='flex flex-row items-center mb-1 border-b border-gray-300 pb-1'>
              <View className='flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-blue-500'>
                <Feather name='user' size={16} color='#fff' />
              </View>
              <View className='flex flex-col'>
                {!isGroupChat ? (
                  <Text className='text-xs font-semibold capitalize'>
                    {replyMessage.sendBy === userData.uid
                      ? 'You'
                      : otherUserFirstName}
                  </Text>
                ) : (
                  <Text className='text-xs font-semibold capitalize'>
                    {replyMessage.sendBy === userData.uid
                      ? 'You'
                      : chatUsers.find(user => user.uid === replyMessage.sendBy)
                          ?.firstName}
                  </Text>
                )}
                <Text
                  className={`text-xs ${
                    isSentByMe ? 'text-teal-100' : 'text-zinc-500'
                  }`}
                >
                  {replyMessage.text}
                </Text>
              </View>
            </View>
          )}
          {image && !dontShowForAll && <ChatBubbleImage image={image} />}

          {dontShowForAll && (
            <Text className='text-gray-500 text-base pl-2 pr-16 pb-1'>
              This message was deleted
            </Text>
          )}

          {isGroupChat && (
            <Text
              className={`${
                isSentByMe ? 'text-cyan-300' : 'text-gray-500'
              } text-xs absolute top-0.5 right-1.5 w-max`}
            >
              {sendBy !== userData.uid &&
                chatUsers.find(user => user.uid === sendBy)?.firstName}
            </Text>
          )}

          {!dontShowForAll && message && (
            <Text
              className={`${
                isSentByMe ? 'text-white' : 'text-black'
              } text-base pl-2 pr-16 pb-1`}
            >
              {message}
            </Text>
          )}

          <Text
            className={`${
              isSentByMe ? 'text-cyan-300' : 'text-gray-500'
            } text-xs absolute bottom-0.5 right-1.5 w-max`}
          >
            {format(new Date(timeStamp), 'hh:mm a')}
          </Text>
        </View>
      </Pressable>
    </>
  )
}

export default ChatBubble
