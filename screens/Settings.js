import React from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  ToastAndroid
} from 'react-native'
import Input from '../components/Input'
import TextAreaInput from '../components/TextAreaInput'
import { Feather, FontAwesome } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import { setUserFormData, setIsLoading } from '../store/redux/userDataSlice'
import SubmitButton from '../components/SubmitButton'
import { updateUserInfoInDB } from '../firebase/auth/userActions'
import { saveUser } from '../store/redux/authSlice'
import { userLogout } from '../firebase/auth/actions'
import ProfileImage from '../components/ProfileImage'

export default function Settings () {
  const dispatch = useDispatch()
  const { userFormData, isLoading } = useSelector(state => state.userData)
  const { userData } = useSelector(state => state.auth)

  React.useEffect(() => {
    dispatch(
      setUserFormData({
        ...userFormData,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        about: userData?.about || ''
      })
    )
  }, [Alert])

  function handleChange (name, value) {
    dispatch(setUserFormData({ ...userFormData, [name]: value }))
  }

  const handleSubmit = async () => {
    dispatch(setIsLoading(true))
    try {
      await updateUserInfoInDB(
        userFormData.firstName,
        userFormData.lastName,
        userFormData.about,
        userData.uid
      )
      ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT)
      dispatch(
        saveUser({
          userToken: userData.userToken,
          userData: { ...userData, ...userFormData }
        })
      )
    } catch (error) {
      console.log(error)
    }
    dispatch(setIsLoading(false))
  }

  function handleDisabled () {
    if (
      userFormData.firstName === userData?.firstName &&
      userFormData.lastName === userData?.lastName &&
      userFormData.about === userData?.about
    ) {
      return true
    }
    return false
  }

  return (
    <ScrollView className='flex-1 p-5 '>
      <ProfileImage />
      <Input
        id='firstName'
        label='First name'
        icon='user-o'
        iconPack={FontAwesome}
        handleChange={handleChange}
        value={userFormData.firstName}
        // errorText={formErrors.firstName ? formErrors.firstName : null}
        required
      />

      <Input
        id='lastName'
        label='Last name'
        icon='user-o'
        iconPack={FontAwesome}
        handleChange={handleChange}
        value={userFormData.lastName}
        // errorText={formErrors.lastName ? formErrors.lastName : null}
      />

      <TextAreaInput
        id='about'
        label='About'
        icon='user-o'
        iconPack={FontAwesome}
        handleChange={handleChange}
        numberOfLines={5}
        value={userFormData.about}
        // errorText={formErrors.lastName ? formErrors.lastName : null}
      />

      {isLoading ? (
        <ActivityIndicator size='large' color='#00ff00' className='mt-5' />
      ) : (
        <SubmitButton
          title='Save'
          onPress={handleSubmit}
          style={{ marginTop: 20 }}
          disabled={handleDisabled()}
        />
      )}

      <SubmitButton
        title='Logout'
        onPress={() => dispatch(userLogout(userData))}
        style={{ marginTop: 20, marginBottom: 30 }}
        color='red'
        // disabled={handleDisabled()}
      />
    </ScrollView>
  )
}
