import React from 'react'
import { View, Text } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'

export default function NoChats () {
  return (
    <View className='flex-1 flex flex-col items-center justify-center mt-3'>
      <FontAwesome5 name='users' size={60} color='black' />
      <Text className='text-center text-gray-500 mt-4'>You have no chats</Text>
    </View>
  )
}
