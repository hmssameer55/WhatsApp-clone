import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ToastAndroid,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import {
  createChat,
  sendImageMessage,
  sendTextMessage,
  deleteMessages
} from '../firebase/chat/chatActions'
import { useSelector, useDispatch } from 'react-redux'
import Badge from '../components/singleChat/Badge'
import ChatBubble from '../components/singleChat/ChatBubble'
import SendMessageInput from '../components/singleChat/SendMessageInput'
import * as Clipboard from 'expo-clipboard'
import { Keyboard } from 'react-native'
import HeaderIcons from '../components/singleChat/HeaderIcons'
import ReplyBubble from '../components/singleChat/ReplyBubble'
import { useCamera, useImagePicker } from '../utils/ImagePickerHelper'
import { uploadImageToDBForChat } from '../utils/ImagePickerHelper'
import { setIsLoading } from '../store/redux/userDataSlice'
import ImageView from 'react-native-image-viewing'
import CustomAwesomeAlert from '../components/Global/AwesomeAlert'
import truncateMessage from '../utils/truncateHelper'

const ChatScreen = ({ navigation, route }) => {
  //the below data is of the logged in user
  const { userData } = useSelector(state => state.auth)
  const { userChats, chatUsers } = useSelector(state => state.userChats)

  const { isLoading } = useSelector(state => state.userData)

  const singleChatMessages = useSelector(state => state.Messages.chatMessages)

  const dispatch = useDispatch()

  //the below data is of the user that we are chatting with
  const {
    _chatId,
    tmpGroupName,
    uid,
    isGroupChat,
    firstName,
    phone,
    photoURL,
    uids: _uids
  } = route.params.user

  const groupName = Object.values(userChats).find(
    chat => chat?.key === _chatId && chat?.isGroupChat
  )?.groupName

  const groupImg = useMemo(() => {
    const groupImg = Object.values(userChats).find(
      chat => chat?.key === _chatId && chat?.isGroupChat
    )?.groupImg

    return groupImg
  }, [navigation])

  const uids = useMemo(() => {
    const chatData = userChats?.[_chatId]
    if (!chatData) return []

    const uids = chatData?.users.filter(uid => uid !== userData.uid)

    return uids
  }, [])

  let newChatData

  if (isGroupChat && !_chatId) {
    newChatData = {
      users: [userData.uid, ..._uids],
      isGroupChat: true,
      groupName: groupName || tmpGroupName
    }
  } else {
    newChatData = {
      users: [userData.uid, uid]
    }
  }

  const flatListRef = useRef()

  const [messageText, setMessageText] = useState('')
  const [chatId, setChatId] = useState(_chatId || null)

  const [error, setError] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState([])
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [tempUri, setTempUri] = useState(null)

  const [images, setImages] = useState([null])
  const [selectedImage, setSelectedImage] = useState(null)

  const [showDeleteAlert, setShowDeleteAlert] = useState(false)

  const [showDeleteIcon, setShowDeleteIcon] = useState(true)

  const messages = useMemo(() => {
    if (chatId) {
      const messageData = singleChatMessages[chatId]

      if (!messageData) return []

      let messagesSortAndMap = Object.keys(messageData)
        .map(messageId => ({ ...messageData[messageId], messageId: messageId }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      let filterDeletedMessages = messagesSortAndMap?.filter(message => {
        const isDeletedByLoggedInUser =
          message?.deletedForAll === true && message?.deletedBy === userData.uid

        const isDontShowForLoggedInUser = message?.dontShow === userData.uid

        // Include the message in the filtered list if not deleted or deleted by other users
        return !isDeletedByLoggedInUser && !isDontShowForLoggedInUser
      })

      return filterDeletedMessages
    } else {
      return []
    }
  }, [chatId, singleChatMessages, userData.uid])

  //lets find the images in the messages
  useEffect(() => {
    const images = messages
      ?.filter(message => message?.image)
      .map(message => message?.image)
    setImages(images)
  }, [messages])

  const handleNavigateToProfile = () => {
    if (chatId !== null) {
      navigation.navigate('userProfile', {
        user: {
          chatId,
          ...route.params.user,
          groupName,
          groupImg
        }
      })
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          className='flex flex-row items-center -ml-5'
          disabled={!chatId}
          onPress={handleNavigateToProfile}
        >
          <View className='flex items-center justify-center w-11 h-11 mr-3.5 bg-gray-200 rounded-full'>
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                className='w-10 h-10 rounded-full'
              />
            ) : isGroupChat ? (
              groupImg ? (
                <Image
                  source={{ uri: groupImg }}
                  className='w-10 h-10 rounded-full'
                />
              ) : (
                <Feather name='users' size={24} color='black' />
              )
            ) : (
              <Ionicons name='ios-person' size={20} color='black' />
            )}
          </View>
          <View className='flex flex-col w-auto'>
            <Text className='text-lg font-semibold capitalize'>
              {truncateMessage(
                isGroupChat ? groupName || tmpGroupName : firstName,
                selectedMessageIds?.length > 0 ? 10 : 20
              )}
            </Text>
            {uids?.length || _uids?.length ? (
              <Text className='text-sm text-gray-500'>
                {isGroupChat
                  ? (uids?.length || _uids?.length) + ' members'
                  : phone}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )
    })
  }, [groupName, selectedMessageIds, chatId])

  //The below useEffect is used to show the header icons when a message is selected
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectedMessageIds.length > 0 ? (
          <HeaderIcons
            selectedMessageIds={selectedMessageIds}
            copyToClipboard={copyToClipboard}
            setReplyTo={setReplyTo}
            messages={messages}
            userData={userData}
            firstName={firstName}
            setShowDeleteAlert={setShowDeleteAlert}
            showDeleteIcon={showDeleteIcon}
          />
        ) : null
    })

    if (selectedMessageIds?.length == 0 || selectedMessageIds?.length > 1) {
      setReplyTo(null)
    }

    handleCheckDeleteIcon()

    return () => {
      navigation.setOptions({
        headerRight: () => null
      })
    }
  }, [selectedMessageIds, showDeleteIcon])

  //the below useEffect is used to scroll to the end of the chat when the keyboard is visible
  useEffect(() => {
    if (replyTo !== null || !chatId || messages.length == 0) return

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true)
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: true })
        }, 100)
      }
    )

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false)
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  const handleMessageSend = useCallback(async () => {
    if (messageText.trim() === '') return

    try {
      // throw new Error('Test Error')
      if (!chatId) {
        const newChatId = await createChat(userData.uid, newChatData)
        if (newChatId) {
          setChatId(newChatId)
          await sendTextMessage(
            newChatId,
            userData,
            messageText,
            null,
            uids || _uids
          )
          setMessageText('')
        } else {
          console.log('Error: Could not create new chat')
        }
      } else {
        setMessageText('')
        await sendTextMessage(
          chatId,
          userData,
          messageText,
          replyTo && replyTo.messageId,
          uids || _uids
        )
        setReplyTo(null)
        setSelectedMessageIds([])
      }
    } catch (error) {
      console.log('Error:', error)
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 2000)
    }
  }, [messageText, chatId])

  const handleChatBubbleLongPress = messageId => {
    setSelectedMessageIds([...selectedMessageIds, messageId])
  }

  const handleChatBubblePressOut = messageId => {
    setSelectedMessageIds(selectedMessageIds.filter(id => id !== messageId))
  }

  const copyToClipboard = async () => {
    const message = messages.filter(message =>
      selectedMessageIds.includes(message.messageId)
    )
    const messageText = message.map(message => message.text).join('\n')
    await Clipboard.setStringAsync(messageText)
    Platform.OS === 'android' &&
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT)
    setSelectedMessageIds([])
  }

  const handleCheckDeleteIcon = () => {
    const messagesToDelete = messages.filter(message =>
      selectedMessageIds.includes(message.messageId)
    )

    const sendByMe = messagesToDelete.every(
      message => message.sendBy === userData.uid
    )

    const sendByOther = messagesToDelete.every(
      message => message.sendBy !== userData.uid
    )

    if (sendByMe) {
      setShowDeleteIcon(true)
    } else if (sendByOther) {
      setShowDeleteIcon(true)
    } else {
      setShowDeleteIcon(false)
    }
  }

  const handlePickImage = useCallback(async () => {
    try {
      const tempUri = await useImagePicker()
      if (tempUri) {
        setTempUri(tempUri)
        // handleMessageSend()
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Something went wrong while picking the image')
    }
  }, [tempUri])

  const openCamera = useCallback(async () => {
    try {
      const tempUri = await useCamera()
      if (tempUri) {
        setTempUri(tempUri)
        // handleMessageSend()
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Something went wrong while opening the camera')
    }
  }, [tempUri])

  const handleSendImage = useCallback(async () => {
    dispatch(setIsLoading(true))

    try {
      let id = chatId
      if (!id) {
        id = await createChat(userData.uid, newChatData)
        if (id) {
          setChatId(id)
        } else {
          console.log('Error: Could not create new chat')
          dispatch(setIsLoading(false))
          return
        }
      }
      const downloadURL = await uploadImageToDBForChat(tempUri, id)
      if (downloadURL) {
        setTempUri(null)
        await sendImageMessage(
          id,
          userData.uid,
          downloadURL,
          replyTo && replyTo.messageId
        )
        setReplyTo(null)
        setSelectedMessageIds([])
      }
    } catch (error) {
      console.log(error)
      setTempUri(null)
      Alert.alert('Error', 'Something went wrong while sending the image')
    } finally {
      dispatch(setIsLoading(false))
    }
  }, [tempUri, chatId, isLoading])

  const handleDeleteMessage = useCallback(async () => {
    if (selectedMessageIds.length == 0) return

    const messagesToDelete = messages.filter(message =>
      selectedMessageIds.includes(message.messageId)
    )

    const sendByMe = messagesToDelete.every(
      message => message.sendBy === userData.uid
    )

    const sendByOther = messagesToDelete.every(
      message => message.sendBy !== userData.uid
    )

    try {
      dispatch(setIsLoading(true))
      if (sendByMe) {
        await deleteMessages(chatId, selectedMessageIds, userData.uid, 'me')
        setSelectedMessageIds([])
      } else if (sendByOther) {
        console.log('triggered deleteMessages if sendByOther')
        await deleteMessages(chatId, selectedMessageIds, userData.uid, 'other')
        setSelectedMessageIds([])
      } else {
        return Alert.alert(
          'Error',
          'You cant delete messages sent by both of you'
        )
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Something went wrong while deleting the message')
    } finally {
      dispatch(setIsLoading(false))
      setShowDeleteAlert(false)
    }
  }, [selectedMessageIds, chatId, isLoading])

  return (
    <SafeAreaView
      edges={['right', 'left', 'bottom']}
      className='flex-1 flex-col'
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        className='flex-1'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ImageBackground
          source={{
            uri: 'https://i.pinimg.com/originals/0a/0e/0a/0a0e0a0a0a0a0a0a0a0a0a0a0a0a0a0.jpg'
          }}
          className='flex-1'
        >
          {chatId === null && <Badge firstName={firstName} type={'new'} />}
          {error && <Badge firstName={null} type={'error'} />}
          {chatId !== null && messages.length > 0 && (
            <View className='flex-1 px-2.5 pt-1 pb-0'>
              <FlatList
                data={messages}
                keyExtractor={item => item.sendAt}
                renderItem={({ item }) => (
                  <ChatBubble
                    message={item.text}
                    dontShowForAll={item.deletedForAll}
                    image={item?.image}
                    messageId={item.messageId}
                    timeStamp={item.sendAt}
                    isSentByMe={item.sendBy === userData.uid}
                    onLongPress={handleChatBubbleLongPress}
                    onPressOut={handleChatBubblePressOut}
                    isSelected={selectedMessageIds.includes(item.messageId)}
                    selectedMessageIds={selectedMessageIds}
                    replyMessage={messages.find(
                      message => message.messageId === item?.replyTo
                    )}
                    otherUserFirstName={firstName}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    isGroupChat={isGroupChat}
                    sendBy={item.sendBy}
                  />
                )}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: 'flex-start'
                }}
                onContentSizeChange={() =>
                  flatListRef?.current?.scrollToEnd({ animated: false })
                }
                ref={ref => (flatListRef.current = ref)}
              />
            </View>
          )}

          <CustomAwesomeAlert
            show={showDeleteAlert}
            title='Delete Message'
            message='Do you want to delete this message?'
            confirmText='Yes, delete it'
            cancelText='No, cancel'
            onConfirmPressed={async () => {
              await handleDeleteMessage()
              setShowDeleteAlert(false)
            }}
            onCancelPressed={() => {
              setShowDeleteAlert(false)
            }}
            onDismiss={() => {
              setShowDeleteAlert(false)
            }}
            customView={
              <View className='flex items-center justify-center'>
                {isLoading && (
                  <View className='flex items-center justify-center'>
                    <ActivityIndicator size='large' color='cyan' />
                  </View>
                )}
              </View>
            }
          />

          {replyTo !== null && selectedMessageIds.length == 1 && (
            <ReplyBubble replyTo={replyTo} setReplyTo={setReplyTo} />
          )}
        </ImageBackground>
        <SendMessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          handleMessageSend={handleMessageSend}
          handlePickImage={handlePickImage}
          openCamera={openCamera}
          replyTo={replyTo}
        />
      </KeyboardAvoidingView>

      <ImageView
        images={images.map(image => ({ uri: image }))}
        imageIndex={images.indexOf(selectedImage)}
        visible={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
        animationType='slide'
      />
      <CustomAwesomeAlert
        show={tempUri !== null}
        title='Send Image'
        message='Do you want to send this image?'
        confirmText='Yes, send it'
        cancelText='No, cancel'
        onConfirmPressed={async () => {
          await handleSendImage()
        }}
        onCancelPressed={() => {
          setTempUri(null)
        }}
        onDismiss={() => {
          setTempUri(null)
        }}
        customView={
          <View className='flex items-center justify-center'>
            {isLoading && (
              <View className='flex items-center justify-center'>
                <ActivityIndicator size='large' color='cyan' />
              </View>
            )}

            {isLoading == false && tempUri && (
              <Image
                source={{ uri: tempUri }}
                className='w-56 h-48 rounded-12 object-cover'
              />
            )}
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default ChatScreen
