import React from 'react'
import Input from '../components/Input'
import SubmitButton from '../components/SubmitButton'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { signup } from '../firebase/auth/actions'
import { Alert, ActivityIndicator } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { saveUser } from '../store/redux/authSlice'
import {
  setUserFormData,
  setFormErrors,
  setIsLoading
} from '../store/redux/userDataSlice'

export default function SignUpForm (props) {
  const dispatch = useDispatch()
  const { userFormData, formErrors, isLoading } = useSelector(
    state => state.userData
  )

  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState)
  }

  function handleValidation (name, value) {
    const nameRegex = /^[a-zA-Z]+$/
    const lastNameRegex = /^[a-zA-Z]+$/
    const emailRegex = /\S+@\S+\.\S+/

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&_])[A-Za-z\d$@$!%*?&_]{5,15}$/

    const phoneRegex = /^[0-9]+$/

    let errors = { ...formErrors }

    switch (name) {
      case 'firstName':
        errors.firstName = value.match(nameRegex) ? '' : 'Invalid first name'
        break
      case 'lastName':
        errors.lastName = value.match(lastNameRegex) ? '' : 'Invalid last name'
        break
      case 'email':
        errors.email = value.match(emailRegex) ? '' : 'Invalid email address'
        break
      case 'phone':
        errors.phone = value.match(phoneRegex) ? '' : 'Invalid phone number'
        break
      case 'password':
        errors.password = value.match(passwordRegex) ? '' : 'weak password'
        break
      default:
        break
    }

    dispatch(setFormErrors(errors))
  }

  const handleChange = React.useCallback(
    (name, value) => {
      dispatch(setUserFormData({ ...userFormData, [name]: value }))

      handleValidation(name, value)
    },
    [userFormData]
  )

  function handleDisabled () {
    if (
      userFormData.firstName === '' ||
      userFormData.email === '' ||
      userFormData.password === '' ||
      userFormData.phone === ''
    ) {
      return true
    } else if (
      formErrors.firstName !== '' ||
      formErrors.email !== '' ||
      formErrors.password !== '' ||
      formErrors.phone !== ''
    ) {
      return true
    }
    return false
  }

  function handleSubmit () {
    dispatch(setIsLoading(true))
    signup(userFormData)
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
        id='firstName'
        label='First name'
        icon='user-o'
        iconPack={FontAwesome}
        handleChange={handleChange}
        errorText={formErrors.firstName ? formErrors.firstName : null}
        required
      />

      <Input
        id='lastName'
        label='Last name'
        icon='user-o'
        iconPack={FontAwesome}
        handleChange={handleChange}
        errorText={formErrors.lastName ? formErrors.lastName : null}
      />

      <Input
        id='email'
        label='Email'
        icon='mail'
        iconPack={Feather}
        handleChange={handleChange}
        errorText={formErrors.email ? formErrors.email : null}
        autoCapitalize='none'
        keyboardType='email-address'
        required
      />

      <Input
        id='phone'
        label='Phone'
        icon='phone'
        iconPack={Feather}
        handleChange={handleChange}
        errorText={formErrors.phone ? formErrors.phone : null}
        autoCapitalize='none'
        keyboardType='phone-pad'
        required
      />

      <Input
        id='password'
        label='Password'
        icon='lock'
        iconPack={Feather}
        handleChange={handleChange}
        errorText={formErrors.password ? formErrors.password : null}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize='none'
        required
        togglePasswordVisibility={togglePasswordVisibility}
      />

      {isLoading ? (
        <ActivityIndicator size='large' color='#00ff00' className='mt-5' />
      ) : (
        <SubmitButton
          title='Sign up'
          onPress={handleSubmit}
          style={{ marginTop: 20 }}
          disabled={handleDisabled()}
        />
      )}
    </>
  )
}
