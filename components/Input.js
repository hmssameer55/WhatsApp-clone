import React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import colors from '../constants/colors'

const Input = props => {
  const { togglePasswordVisibility, id } = props

  const [localValue, setLocalValue] = React.useState(props.value)

  const onChangeHandler = text => {
    setLocalValue(text.trim(''))
    props.handleChange(props.id, text.trim(''))
  }

  return (
    <View className='w-full'>
      <Text style={styles.label}>
        {props.label}
        {props.required && <Text style={{ color: 'red' }}>*</Text>}
      </Text>

      <View style={styles.inputContainer}>
        {props.icon && (
          <props.iconPack
            name={props.icon}
            size={props.iconSize || 15}
            style={styles.icon}
          />
        )}
        <TextInput
          value={localValue}
          onChangeText={onChangeHandler}
          style={styles.input}
          {...props}
        />
        {id === 'password' && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <FontAwesome
              name={props.secureTextEntry ? 'eye-slash' : 'eye'}
              size={props.iconSize || 18}
              style={styles.icon}
              onPress={togglePasswordVisibility}
            />
          </TouchableOpacity>
        )}
      </View>

      {props.errorText && (
        <View className='mt-1'>
          <Text style={styles.errorText}>{props.errorText}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    marginVertical: 8,
    // fontFamily: 'bold',
    letterSpacing: 0.3,
    color: colors.textColor
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 2,
    backgroundColor: colors.lavender,
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: 10,
    color: colors.grey
  },
  input: {
    color: colors.textColor,
    flex: 1,
    // fontFamily: 'regular',
    letterSpacing: 0.3,
    paddingTop: 0
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    // fontFamily: 'regular',
    letterSpacing: 0.3
  }
})

export default Input
