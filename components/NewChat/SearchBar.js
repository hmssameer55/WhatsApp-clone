import React from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function SearchBar (props) {
  const { handleChange } = props

  return (
    <View className='flex flex-row items-center bg-gray-200 rounded-full p-2'>
      <Feather name='search' size={24} color='black' />
      <TextInput
        className='flex-1 ml-1.5'
        placeholder='Enter phone number...'
        placeholderTextColor='gray'
        onChangeText={handleChange}
        keyboardType='phone-pad'
      />
    </View>
  )
}
