import { View, Text } from 'react-native'
import React from 'react'

export default function Badge (props) {
  const { firstName, type } = props

  const message =
    "You haven't started a chat with " +
    firstName +
    ' yet. Send a message to start chatting !!!'

  const error = 'Failed to send message'

  return (
    <View className='flex-1 items-center px-5'>
      {type === 'new' && (
        <Text
          className='text-center text-white
        text-base bg-neutral-500 rounded-full px-5 py-1.5 mt-5'
        >
          {message}
        </Text>
      )}
      {type === 'error' && (
        <Text
          className='text-center text-white
        text-base bg-red-500 rounded-full px-5 py-1.5 mt-5'
        >
          {error}
        </Text>
      )}
    </View>
  )
}
