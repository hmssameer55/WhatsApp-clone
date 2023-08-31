import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import truncateMessage from '../../utils/truncateHelper'

export default function ReplyBubble (props) {
  const { replyTo, setReplyTo } = props

  return (
    <View className='px-2.5 mx-1 py-1.5 bg-sky-100 border-2 border-cyan-400 rounded-t'>
      <View className='flex flex-row items-center justify-between '>
        <Text className='text-sm text-gray-500'>
          Replying to{' '}
          <Text className='font-semibold text-gray-700'>
            {replyTo?.ReplyToName}
          </Text>
        </Text>
        <TouchableOpacity
          onPress={() => setReplyTo(null)}
          className='flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full'
        >
          <Feather name='x' size={16} color='black' />
        </TouchableOpacity>
      </View>
      <Text className='px-1 py-1.5 text-sm text-gray-500'>
        {truncateMessage(replyTo?.text, 60)}
      </Text>
    </View>
  )
}
