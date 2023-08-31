import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'

export default function GroupProfile (props) {
  const { item, onPress } = props

  return (
    <View className='relative mx-1 items-center w-14'>
      {item.profileImage ? (
        <Image
          source={{ uri: item.profileImage }}
          className='w-10 h-10 rounded-full'
        />
      ) : (
        <View className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
          <FontAwesome5 name='user' size={24} color='black' />
        </View>
      )}
      {/* Mini "x" icon */}
      <TouchableOpacity
        className='absolute top-0 right-0 bg-red-500 rounded-full p-1'
        onPress={onPress}
      >
        <FontAwesome5 name='times' size={12} color='white' />
      </TouchableOpacity>
      <View className='ml-2 '>
        <Text className='font-semibold text-center'>{item.firstName}</Text>
      </View>
    </View>
  )
}
