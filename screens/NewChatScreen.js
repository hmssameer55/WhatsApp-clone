import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Button
} from 'react-native'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import { searchUsersInDB } from '../firebase/auth/userActions'
import UserListItem from '../components/UserListItem'
import { useSelector } from 'react-redux'
import SearchBar from '../components/NewChat/SearchBar'
import GroupProfile from '../components/NewChat/GroupProfile'
import AwesomeAlert from 'react-native-awesome-alerts'

export default function NewChatScreen ({ navigation, route }) {
  const { type, existingUsersWithChatId: existingUsers, chatId } = route.params

  const { userData } = useSelector(state => state.auth)
  const { userChats, chatUsers } = useSelector(state => state.userChats)

  const [searchNumber, setSearchNumber] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  //for group chat the below state will not have _chatId and for single chat it will have _chatId
  const [existingUsersWithChatId, setExistingUsersWithChatId] = useState([])

  const [groupMembers, setGroupMembers] = useState([])
  const [groupName, setGroupName] = useState('')

  const [showAlert, setShowAlert] = useState(false)

  const handleNavigateToGroupChat = () => {
    navigation.navigate('userProfile', {
      user: {
        uid: null,
        phone: null,
        photoURL: null,
        _chatId: chatId,
        isGroupChat: true,
        selectedUsers: groupMembers
      }
    })
    setGroupMembers([])
    setGroupName('')
    setSearchNumber('')
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: type === 'group' ? 'New Group' : 'New Chat',

      headerRight: () => {
        return !chatId ? (
          <TouchableOpacity
            className='mr-3'
            onPress={() => setShowAlert(true)}
            disabled={groupMembers.length === 0}
          >
            {type === 'group' && (
              <Text
                className={`${
                  groupMembers.length === 0 ? 'text-gray-500' : 'text-blue-500'
                } font-semibold`}
              >
                Next
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className='mr-3'
            onPress={handleNavigateToGroupChat}
            disabled={groupMembers.length === 0}
          >
            {type === 'group' && (
              <Text
                className={`${
                  groupMembers.length === 0 ? 'text-gray-500' : 'text-blue-500'
                } font-semibold`}
              >
                Add
              </Text>
            )}
          </TouchableOpacity>
        )
      }
    })
  }, [type, groupMembers])

  useEffect(() => {
    if (chatId) return

    const existingUsers = Object.values(userChats).filter(
      chat => chat.users.includes(userData.uid) && !chat.isGroupChat
    )

    const chatUsersWithChatId = existingUsers.map(chat => {
      const otherUser = chat.users.find(user => user !== userData.uid)
      const otherUserData = chatUsers.find(user => user.uid === otherUser)
      return {
        ...otherUserData,
        ...(type !== 'group' && { _chatId: chat.key })
      }
    })

    setExistingUsersWithChatId(chatUsersWithChatId)
  }, [userChats])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchNumber.length >= 5) {
        setLoading(true)
        try {
          const response = await searchUsersInDB(searchNumber)
          const results = Object.keys(response).map(key => response[key])

          if (type === 'group') {
            if (
              existingUsersWithChatId?.find(
                user => user.phone === searchNumber
              ) ||
              existingUsers?.find(user => user.phone === searchNumber)
            ) {
              return
            } else {
              setExistingUsersWithChatId(prev => [...prev, ...results])
            }
            return
          }

          setUsers(results.filter(user => user.uid !== userData.uid))
        } catch (error) {
          setError(error)
        } finally {
          setLoading(false)
        }
      } else {
        setUsers([])
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchNumber])

  const handlePress = (item, id) => {
    navigation.navigate('singleChat', {
      user: {
        uid: item.uid,
        firstName: item.firstName,
        phone: item.phone,
        photoURL: item.profileImage,
        _chatId: id
      }
    })
  }

  const handleChange = text => {
    setSearchNumber(text)
  }

  const handleAddMember = item => {
    setGroupMembers([...groupMembers, item])
  }

  const removeMember = uid => {
    setGroupMembers(groupMembers.filter(member => member.uid !== uid))
  }

  return (
    <View className='flex-1 p-3'>
      {type === 'group' && groupMembers.length > 0 && (
        <View className='flex flex-row items-center justify-between p-2'>
          <FlatList
            data={groupMembers}
            keyExtractor={item => item.uid}
            horizontal
            renderItem={({ item }) => {
              return (
                <GroupProfile
                  item={item}
                  onPress={() => removeMember(item.uid)}
                />
              )
            }}
          />
        </View>
      )}

      <SearchBar handleChange={handleChange} />
      <View>
        {type === 'group' && (
          <FlatList
            data={existingUsersWithChatId}
            keyExtractor={item => item.uid}
            renderItem={({ item }) => {
              return (
                <UserListItem
                  user={item}
                  type='group'
                  onPress={() => handleAddMember(item)}
                  showTick={groupMembers.includes(item)}
                />
              )
            }}
            contentContainerStyle={{ marginTop: 10 }}
          />
        )}
        <FlatList
          data={users}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => {
            let filteredChats = Object.values(userChats)?.filter(
              chat =>
                chat?.users?.includes(item.uid) &&
                chat?.users?.includes(userData.uid) &&
                !chat?.isGroupChat
            )

            let id = null

            if (filteredChats.length > 0) {
              // Remove isGroupChat property and get the id from the filtered chats
              const chatWithoutGroupProp = filteredChats[0]
              delete chatWithoutGroupProp.isGroupChat
              id = chatWithoutGroupProp.key
            }

            return (
              <UserListItem user={item} onPress={() => handlePress(item, id)} />
            )
          }}
          contentContainerStyle={{ marginTop: type === 'group' ? 0 : 10 }}
        />
      </View>

      {searchNumber.length === 0 ? (
        <View className='flex-1 flex flex-col items-center justify-center mt-3'>
          <FontAwesome5 name='users' size={60} color='black' />
          <Text className='text-center text-gray-500 mt-4'>
            Search for someone to start chatting with or go to Contacts to see
            who is available
          </Text>
        </View>
      ) : loading ? (
        <Text className='text-center mt-3'>Loading...</Text>
      ) : users.length === 0 ? (
        <View className='flex-1 flex flex-col items-center justify-center mt-3'>
          <FontAwesome5 name='question-circle' size={60} color='black' />
          <Text className='text-center text-gray-500 mt-4'>
            No results found
          </Text>
        </View>
      ) : null}

      <AwesomeAlert
        show={showAlert}
        title='Enter Group Name'
        messageStyle={{ textAlign: 'center', marginBottom: 20 }}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        onDismiss={() => setShowAlert(false)}
        customView={
          <View className='flex flex-col px-8 py-3'>
            <TextInput
              placeholder='Group Name'
              className='border-b-2 border-gray-300 p-2'
              onChangeText={text => setGroupName(text)}
              autoCorrect={false}
              autoFocus={true}
              maxLength={25}
            />
            <View className='flex flex-row items-center justify-between mt-5'>
              <TouchableOpacity
                className='mr-3'
                onPress={() => setShowAlert(false)}
              >
                <Text className='text-gray-500 font-semibold'>Cancel</Text>
              </TouchableOpacity>
              <Button
                title='Create'
                disabled={groupName.length === 0}
                className='mr-3'
                onPress={() => {
                  navigation.navigate('singleChat', {
                    user: {
                      uid: null,
                      tmpGroupName: groupName,
                      phone: null,
                      photoURL: null,
                      _chatId: null,
                      isGroupChat: true,
                      uids: groupMembers.map(member => member.uid)
                    }
                  })
                  setGroupMembers([])
                  setGroupName('')
                  setSearchNumber('')
                  setShowAlert(false)
                }}
              >
                <Text className='text-blue-500 font-semibold'>Create</Text>
              </Button>
            </View>
          </View>
        }
      />
    </View>
  )
}
