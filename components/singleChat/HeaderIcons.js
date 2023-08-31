import React from 'react'
import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function HeaderIcons (props) {
  const {
    selectedMessageIds,
    copyToClipboard,
    setReplyTo,
    messages,
    userData,
    firstName: otherUserName,
    setShowDeleteAlert,
    showDeleteIcon
  } = props

  const handleReplyPress = () => {
    const message = messages.find(
      message => message.messageId === selectedMessageIds[0]
    )
    const ReplyToName = message?.sendBy === userData.uid ? 'You' : otherUserName
    setReplyTo({ ...message, ReplyToName })
  }

  return (
    <View className='flex flex-row items-center'>
      {selectedMessageIds.length === 1 ? (
        <TouchableOpacity
          onPress={handleReplyPress}
          style={{ marginHorizontal: 10 }}
        >
          <Feather name='corner-up-left' size={24} color='black' />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={copyToClipboard}
        style={{ marginHorizontal: 10 }}
      >
        <Feather name='copy' size={24} color='black' />
      </TouchableOpacity>
      {/* <TouchableOpacity
      onPress={() => {
        // Implement your star logic here
        console.log('Star:', selectedMessageIds)
      }}
      style={{ marginHorizontal: 10 }}
    >
      <Feather name='star' size={24} color='black' />
    </TouchableOpacity> */}

      <TouchableOpacity
        onPress={() => {
          setShowDeleteAlert(true)
        }}
        style={{ marginHorizontal: 10 }}
        className={`${showDeleteIcon ? 'flex' : 'hidden'}`}
      >
        <Feather name='trash-2' size={24} color='black' />
      </TouchableOpacity>
    </View>
  )
}
