import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './navigators'
import { FirebaseApp } from './firebase/helper'
import { Provider } from 'react-redux'
import { Store } from './store/store'

FirebaseApp()

export default function App () {
  return (
    <SafeAreaProvider>
      <Provider store={Store}>
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  )
}
