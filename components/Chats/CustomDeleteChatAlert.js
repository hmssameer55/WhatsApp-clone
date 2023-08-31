import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import AwesomeAlert from 'react-native-awesome-alerts'

export default function CustomDeleteChatAlert (props) {
  const {
    showDeleteAlert,
    setShowDeleteAlert,
    validateDelete,
    handleDeleteChats
  } = props
  return (
    <AwesomeAlert
      show={showDeleteAlert}
      showProgress={false}
      title='Delete Chats'
      message={
        validateDelete()
          ? 'Confirm deletion? Chats will be permanently deleted for all members.'
          : 'You cant delete chats that you didnt create'
      }
      closeOnTouchOutside={true}
      closeOnHardwareBackPress={false}
      customView={
        <View className='flex flex-row items-center justify-center w-full mt-5'>
          <TouchableOpacity
            className='flex flex-row items-center justify-center w-1/2 py-2 mr-2 bg-white rounded-md'
            onPress={() => setShowDeleteAlert(false)}
          >
            <Text className='text-lg font-semibold text-gray-500'>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex flex-row items-center justify-center w-1/2 py-2 ml-2 rounded-md'
            style={{
              backgroundColor: validateDelete() ? '#f61e1e' : '#E5E7EB'
            }}
            disabled={validateDelete() ? false : true}
            onPress={handleDeleteChats}
          >
            <Text className='text-lg font-semibold text-white'>Delete</Text>
          </TouchableOpacity>
        </View>
      }
      onDismiss={() => setShowDeleteAlert(false)}
      onBackButtonPress={() => setShowDeleteAlert(false)}
    />
  )
}
