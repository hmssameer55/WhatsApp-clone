import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import colors from '../constants/colors'

const TextAreaInput = props => {
  const [localValue, setLocalValue] = React.useState(props.value)

  const onChangeHandler = text => {
    setLocalValue(text)
    props.handleChange(props.id, text)
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
          multiline={true}
          numberOfLines={props.numberOfLines || 3}
          onChangeText={onChangeHandler}
          style={styles.input}
          {...props}
        />
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
    borderRadius: 2,
    backgroundColor: colors.lavender,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
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

export default TextAreaInput
