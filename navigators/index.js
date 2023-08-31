import React from 'react'
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import MainNavigator from './MainNavigator'
import UserNavigator from './userNavigator'
import { useSelector } from 'react-redux'
import StartupScreen from '../screens/StartupScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { refreshJwtToken } from '../firebase/auth/actions'

// AsyncStorage.clear()

export default function AppNavigator () {
  const isAuth = useSelector(state => state.auth.userToken !== null)

  const didTryAutoLogin = useSelector(state => state.auth.didTryAutoLogin)

  console.log('isAuth: ', isAuth, 'didTryAutoLogin: ', didTryAutoLogin)

  React.useEffect(() => {
    if (didTryAutoLogin) {
      if (isAuth) {
        refreshJwtToken()
      }
    }
  }, [didTryAutoLogin, isAuth])

  return (
    <NavigationContainer>
      {isAuth && <MainNavigator />}
      {didTryAutoLogin && !isAuth && <UserNavigator />}
      {!isAuth && !didTryAutoLogin && <StartupScreen />}
    </NavigationContainer>
  )
}
