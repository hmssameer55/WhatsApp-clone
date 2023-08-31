import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch } from 'react-redux'
import { setDidTryAtuoLogin, saveUser } from '../store/redux/authSlice'
import { getUserFromDB } from '../firebase/auth/userActions'

export default function StartupScreen () {
  const dispatch = useDispatch()

  useEffect(() => {
    const tryLogin = async () => {
      const userData = await AsyncStorage.getItem('userData')
      if (!userData) {
        dispatch(setDidTryAtuoLogin())
        return
      }
      const transformedData = JSON.parse(userData)
      const { token, uid, expirationTime } = transformedData
      // const expirationDate = new Date(expirationTime)
      // if (expirationDate <= new Date() || !token || !uid) {
      if (!token || !uid) {
        dispatch(setDidTryAtuoLogin())
        return
      }
      const user = await getUserFromDB(uid)
      dispatch(setDidTryAtuoLogin())
      dispatch(saveUser({ userToken: token, userData: user }))
    }
    tryLogin()
  }, [dispatch])

  return (
    <View className='flex-1 justify-center items-center'>
      <ActivityIndicator size='large' />
    </View>
  )
}
