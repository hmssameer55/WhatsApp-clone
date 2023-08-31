import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Logo from '../assets/logo.png'
import PageContainer from '../components/PageContainer'
import SignInForm from '../components/SignInForm'
import SignUpForm from '../components/SignUpForm'
import { StatusBar } from 'expo-status-bar'

export default function UserScreen () {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <SafeAreaView className='flex-1' edges={['right', 'bottom', 'left']}>
      <PageContainer>
        <StatusBar style='dark' backgroundColor='blue' />

        <ScrollView>
          <KeyboardAvoidingView
            className='flex-1 justify-center'
            behavior={Platform.OS === 'ios' ? 'height' : null}
            keyboardVerticalOffset={100}
          >
            <View className='flex-1 justify-center items-center mt-16 mb-5'>
              <Image
                className='w-auto h-32'
                source={Logo}
                resizeMode='contain'
              />
            </View>

            {isSignUp ? <SignUpForm /> : <SignInForm />}

            <TouchableOpacity
              onPress={() => setIsSignUp(prevState => !prevState)}
              className='flex-1 justify-center items-center mt-2'
            >
              <Text className='text-blue-500 font-medium'>
                {`Switch to ${isSignUp ? 'sign in' : 'sign up'}`}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>
      </PageContainer>
    </SafeAreaView>
  )
}
