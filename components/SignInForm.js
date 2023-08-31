import React from 'react'
import Input from '../components/Input'
import SubmitButton from '../components/SubmitButton'
import { Feather } from '@expo/vector-icons'
import { login } from '../firebase/auth/actions'
import { ActivityIndicator, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { saveUser } from '../store/redux/authSlice'
import {
  setUserFormData,
  setFormErrors,
  setIsLoading
} from '../store/redux/userDataSlice'

export default function SignInForm (props) {
  const dispatch = useDispatch()
  const { userFormData, formErrors, isLoading } = useSelector(
    state => state.userData
  )

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState)
  }

  function handleValidation (id, value) {
    let errors = { ...formErrors }

    switch (id) {
      case 'email':
        errors.email = value.match(/\S+@\S+\.\S+/)
          ? ''
          : 'Invalid email address'
        break
      case 'password':
        errors.password = value.length >= 5 ? '' : 'Password is too short'
        break
      default:
        break
    }

    dispatch(setFormErrors(errors))
  }

  function handleChange (id, value) {
    dispatch(setUserFormData({ ...userFormData, [id]: value }))
    handleValidation(id, value)
  }

  function handleDisabled () {
    if (!userFormData.email || !userFormData.password) {
      return true
    } else if (formErrors.email || formErrors.password) {
      return true
    }
    return false
  }

  function handleSubmit () {
    dispatch(setIsLoading(true))
    login(userFormData)
      .then(user => {
        dispatch(
          saveUser({
            userToken: user.token,
            userData: user
          })
        )
      })
      .catch(error => {
        Alert.alert('Error', error.message)
      })
      .finally(() => {
        dispatch(setIsLoading(false))
      })
  }

  return (
    <>
      <Input
        label='Email'
        icon='mail'
        iconPack={Feather}
        handleChange={handleChange}
        errorText={formErrors.email ? formErrors.email : null}
        id='email'
        autoCapitalize='none'
        keyboardType='email-address'
        required
      />

      <Input
        label='Password'
        icon='lock'
        iconPack={Feather}
        handleChange={handleChange}
        errorText={formErrors.password ? formErrors.password : null}
        id='password'
        secureTextEntry={!isPasswordVisible}
        autoCapitalize='none'
        required
        togglePasswordVisibility={togglePasswordVisibility}
      />

      {isLoading ? (
        <ActivityIndicator size='large' color='#00ff00' className='mt-5' />
      ) : (
        <SubmitButton
          title='Sign in'
          onPress={handleSubmit}
          style={{ marginTop: 20 }}
          disabled={handleDisabled()}
        />
      )}
    </>
  )
}
