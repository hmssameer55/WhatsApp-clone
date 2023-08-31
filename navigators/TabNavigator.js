import { View, Text, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Chats from '../screens/Chats'
import Settings from '../screens/Settings'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'

export default function TabNavigator () {
  const Tab = createBottomTabNavigator()
  const navigation = useNavigation()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { height: 65, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 14 }
      }}
    >
      <Tab.Screen
        name='Chats'
        component={Chats}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='ios-chatbubbles' size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name='Settings'
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='ios-settings' size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}
