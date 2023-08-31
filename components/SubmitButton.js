import React from 'react'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import colors from '../constants/colors'

export default function SubmitButton (props) {
  const { color, disabled, onPress, style, title } = props

  const enabledBgColor = color || colors.primary
  const bgColor = disabled ? colors.lightGrey : enabledBgColor

  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : onPress}
      style={{
        ...styles.button,
        ...style,
        ...{ backgroundColor: bgColor }
      }}
    >
      <Text style={{ color: disabled ? colors.grey : 'white' }}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
