import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function RenderGroupMember (props) {
  const { item, isAdmin, onPress } = props

  return (
    <View className='flex flex-row items-center justify-between w-full px-5 py-3 mt-2 bg-white rounded-md'>
      <View className='flex flex-row items-center'>
        {item?.profileImage ? (
          <Image
            source={{ uri: item?.profileImage }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Feather name='user' size={24} color='black' />
        )}
        <Text className='ml-2.5 text-lg font-semibold'>{item.firstName}</Text>
      </View>
      {isAdmin && (
        <TouchableOpacity onPress={() => onPress(item.uid)}>
          <Feather name='minus-circle' size={24} color='black' />
        </TouchableOpacity>
      )}
    </View>
  )
}
