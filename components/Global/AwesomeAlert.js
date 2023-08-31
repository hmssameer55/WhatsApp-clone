import React from 'react'
import { View, Text } from 'react-native'
import AwesomeAlert from 'react-native-awesome-alerts'
import colors from '../../constants/colors'

export default function CustomAwesomeAlert (props) {
  const {
    show,
    title,
    message,
    confirmText,
    cancelText,
    onConfirmPressed,
    onCancelPressed,
    onDismiss,
    customView
  } = props

  return (
    <AwesomeAlert
      show={show}
      title={title}
      message={message}
      messageStyle={{ textAlign: 'center', marginBottom: 20 }}
      closeOnTouchOutside={true}
      closeOnHardwareBackPress={false}
      showCancelButton={true}
      showConfirmButton={true}
      cancelText={cancelText}
      confirmText={confirmText}
      confirmButtonColor={colors.salmon}
      onDismiss={onDismiss}
      onCancelPressed={onCancelPressed}
      onConfirmPressed={onConfirmPressed}
      customView={customView}
    />
  )
}
