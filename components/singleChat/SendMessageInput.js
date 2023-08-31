import React from 'react'
import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import colors from '../../constants/colors'

export default function SendMessageInput (props) {
  const {
    messageText,
    setMessageText,
    handleMessageSend,
    handlePickImage,
    openCamera,
    replyTo
  } = props
  const inputRef = React.useRef()

  React.useEffect(() => {
    if (replyTo) {
      Keyboard.dismiss()
      inputRef.current.focus()
    }
  }, [replyTo])

  return (
    <View className='flex-row items-center justify-between px-3 py-5 bg-slate-200'>
      <TouchableOpacity
        className='items-center justify-center  w-10 h-10 rounded-full'
        onPress={handlePickImage}
      >
        <Ionicons name='add-circle-outline' size={35} color={'#0891b2'} />
      </TouchableOpacity>

      <View className='flex-1 flex-row items-center justify-between bg-slate-400 rounded-full mx-2'>
        <TextInput
          ref={inputRef}
          multiline
          autoCapitalize='none'
          placeholder='Type a message'
          placeholderTextColor={'#cbd5e0'}
          className='flex-1 px-4 py-2 text-white'
          value={messageText}
          onChangeText={text => setMessageText(text)}
          style={{
            maxHeight: 80
          }}
        />
      </View>

      <TouchableOpacity
        className={`items-center justify-center w-10 h-10 rounded-full ${
          messageText.trim() ? 'bg-cyan-700' : ''
        }`}
        onPress={messageText.trim() ? handleMessageSend : openCamera}
      >
        <Feather
          name={messageText.trim() ? 'send' : 'camera'}
          size={messageText.trim() ? 22 : 28}
          color={messageText.trim() ? '#fff' : '#0891b2'}
        />
      </TouchableOpacity>
    </View>
  )
}
