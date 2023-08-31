import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Button
} from 'react-native'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome5, Feather } from '@expo/vector-icons'
import ProfileImage from '../components/ProfileImage'
import {
  updateGroupName,
  removeMember,
  addUserToChat
} from '../firebase/chat/chatActions'
import RenderGroupMember from '../components/UserProfile/RenderGroupMember'
import AwesomeAlert from 'react-native-awesome-alerts'

export default function UserProfile ({ route, navigation }) {
  const {
    _chatId,
    chatId,
    uid,
    firstName,
    phone,
    photoURL,
    groupImg,
    isGroupChat,
    uids: _uids,
    about,
    selectedUsers
  } = route.params.user

  const [groupMembers, setGroupMembers] = useState([])

  const { userChats, chatUsers } = useSelector(state => state.userChats)
  const { userData } = useSelector(state => state.auth)

  const chatData = userChats[_chatId || chatId]

  const [name, setName] = useState('')
  const [displayGroupName, setDisplayGroupName] = useState('')

  const [memberToRemove, setMemberToRemove] = useState({})

  const [showAlert, setShowAlert] = useState(false)

  const isAdmin = userChats[_chatId || chatId]?.createdBy === userData.uid

  const [uids, setUids] = useState([])

  useEffect(() => {
    if (!selectedUsers) {
      return
    }

    const uids = selectedUsers?.map(user => user.uid)

    const addUsersToChat = async () => {
      try {
        await addUserToChat(_chatId || chatId, uids, userData.uid)
        setUids(prev => [...prev, ...uids])
      } catch (err) {
        console.log(err)
      }
    }

    addUsersToChat()
  }, [selectedUsers])

  useEffect(() => {
    const chatData = userChats?.[_chatId || chatId]
    if (chatData) {
      const uids = chatData?.users?.filter(uid => uid !== userData.uid)
      setUids(uids)
    } else {
      setUids([])
    }
  }, [userChats])

  useEffect(() => {
    const groupName = userChats[_chatId || chatId]?.groupName
    setName(groupName)
    setDisplayGroupName(groupName)
  }, [userChats])

  useEffect(() => {
    if (isGroupChat && uids.length > 0) {
      const members = (uids && uids.length > 0 ? uids : _uids)
        .filter(uid => uid !== userData.uid)
        .map(uid => chatUsers.find(user => user.uid === uid))
      setGroupMembers(members)
    } else {
      setGroupMembers([])
    }
  }, [uids])

  useEffect(() => {
    navigation.setOptions({
      title: isGroupChat ? 'Group Info' : firstName
    })
  }, [])

  const handleUpdateGroupName = async () => {
    await updateGroupName(_chatId || chatId, name, userData.uid)
    setDisplayGroupName(name)
  }

  const handleShowAlert = uid => {
    setShowAlert(true)
    setMemberToRemove(groupMembers.find(member => member.uid === uid))
  }

  const handleRemoveMember = async () => {
    try {
      const updatedUsers = chatData.users.filter(
        user => user !== memberToRemove.uid
      )

      await removeMember(
        _chatId || chatId,
        memberToRemove.uid,
        userData.uid,
        updatedUsers
      )
      setUids(updatedUsers)
    } catch (err) {
      console.log(err)
    } finally {
      setMemberToRemove({})
      setShowAlert(false)
    }
  }

  const handleLeave = async () => {
    if (!isAdmin) {
      try {
        const updatedUsers = chatData.users.filter(
          user => user !== userData.uid
        )

        await removeMember(
          _chatId || chatId,
          userData.uid,
          userData.uid,
          updatedUsers
        )
        setUids(updatedUsers)
      } catch (err) {
        console.log(err)
      } finally {
        setMemberToRemove({})
        setShowAlert(false)
        navigation.navigate('Home')
      }
    }
  }

  const handleAddMember = () => {
    navigation.navigate('newChat', {
      type: 'group',
      chatId: _chatId || chatId,
      existingUsersWithChatId: groupMembers
    })
  }

  return (
    <SafeAreaView edges={['right', 'top', 'left']} style={{ flex: 1 }}>
      <View className='flex flex-col w-full h-full pt-5'>
        <View className='flex flex-col items-center justify-center w-full'>
          <ProfileImage
            photoURL={photoURL}
            groupImg={groupImg}
            isGroupChat={isGroupChat}
            chatId={_chatId || chatId}
          />
          {isGroupChat ? (
            <>
              <Text className='mt-2 text-2xl font-semibold'>
                {displayGroupName}
              </Text>
              <View className='flex flex-row items-center justify-center mx-6 mt-3 px-5 bg-white rounded-md'>
                <TextInput
                  className='w-full px-2 py-2 text-lg text-gray-500 rounded-md'
                  value={name}
                  onChangeText={text => setName(text)}
                  maxLength={20}
                />
                <TouchableOpacity
                  disabled={name === displayGroupName}
                  onPress={handleUpdateGroupName}
                >
                  <FontAwesome5
                    name='check'
                    size={24}
                    color={name === displayGroupName ? 'gray' : '#3182ce'}
                  />
                </TouchableOpacity>
              </View>
              <View className='w-full px-5'>
                <Text className='mt-5 text-md text-gray-500'>
                  {groupMembers.length} members
                </Text>
                <TouchableOpacity
                  className='flex flex-row items-center mt-2 py-2'
                  onPress={handleAddMember}
                >
                  <Feather name='plus-circle' size={25} color='#3182ce' />
                  <Text className='ml-2.5 text-xl font-semibold text-blue-500'>
                    Add member
                  </Text>
                </TouchableOpacity>
                <FlatList
                  data={groupMembers}
                  keyExtractor={item => item.uid}
                  renderItem={({ item }) => (
                    <RenderGroupMember
                      item={item}
                      isAdmin={isAdmin}
                      onPress={handleShowAlert}
                    />
                  )}
                />
              </View>
            </>
          ) : (
            <>
              <Text className='mt-2 text-2xl font-semibold'>{firstName}</Text>
              <Text className='mt-2 text-md text-gray-500'>{phone}</Text>
              <Text className='mt-2 text-base text-gray-500'>{about}</Text>
            </>
          )}
        </View>
        {isGroupChat && !isAdmin && (
          <View className='absolute bottom-5 left-0 right-0'>
            <TouchableOpacity
              className='flex flex-row items-center justify-center mx-2 py-3 bg-red-500 rounded-md'
              onPress={handleLeave}
            >
              <Text className='text-center text-white'>Leave group</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title='Are you sure?'
        message={
          uids.length > 1
            ? 'Remove this member from the group?'
            : 'There must be at least one member in the group.'
        }
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        customView={
          <View className='flex flex-row items-center justify-center w-full mt-5'>
            <TouchableOpacity
              className='flex flex-row items-center justify-center w-1/2 py-2 mr-2 bg-white rounded-md'
              onPress={() => {
                setShowAlert(false)
                setMemberToRemove({})
              }}
            >
              <Text className='text-lg font-semibold text-gray-500'>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='flex flex-row items-center justify-center w-1/2 py-2 ml-2 bg-red-500 rounded-md'
              onPress={handleRemoveMember}
            >
              <Text className='text-lg font-semibold text-white'>Remove</Text>
            </TouchableOpacity>
          </View>
        }
        onDismiss={() => {
          setShowAlert(false)
          setMemberToRemove({})
        }}
        onHardwareBackPress={() => {
          setShowAlert(false)
          setMemberToRemove({})
        }}
      />
    </SafeAreaView>
  )
}
