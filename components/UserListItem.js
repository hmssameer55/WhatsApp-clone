import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Feather, FontAwesome5, AntDesign } from '@expo/vector-icons'

export default function UserListItem ({ user, onPress, type, showTick }) {
  const { firstName, lastName, email, profileImage } = user

  return (
    <View className='flex flex-col mt-3'>
      <TouchableOpacity
        className='flex flex-row items-center justify-between p-2'
        onPress={!showTick ? onPress : null}
      >
        <View className='flex flex-row items-center'>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              className='w-10 h-10 rounded-full'
            />
          ) : (
            <View className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
              <FontAwesome5 name='user' size={24} color='black' />
            </View>
          )}
          <View className='ml-2'>
            <Text className='font-semibold'>
              {firstName} {lastName}
            </Text>
            <Text className='text-gray-500'>{email}</Text>
          </View>
        </View>
        <View className='flex flex-row items-center'>
          {type === 'group' ? (
            showTick ? (
              <FontAwesome5 name='check' size={24} color='black' />
            ) : (
              <AntDesign name='pluscircle' size={24} color='black' />
            )
          ) : (
            <Feather name='message-square' size={24} color='black' />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}
