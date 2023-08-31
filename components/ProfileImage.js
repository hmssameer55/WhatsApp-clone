import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import {
  useImagePicker,
  uploadImageToDB,
  uploadImageToDBForGroup
} from '../utils/ImagePickerHelper' // Import both functions from the same path
import { useSelector } from 'react-redux' // Removed unnecessary useDispatch import

export default function ProfileImage ({
  photoURL,
  isGroupChat,
  chatId,
  groupImg
}) {
  const { userData } = useSelector(state => state.auth)
  const [image, setImage] = React.useState(
    photoURL || userData?.profileImage || null
  ) // Prioritize incoming photoURL
  const [isLoading, setIsLoading] = React.useState(false)

  const [groupImage, setGroupImage] = React.useState(groupImg || null)

  const { uid } = userData

  const launchImagePicker = async () => {
    setIsLoading(true)
    try {
      const tempUri = await useImagePicker()

      if (isGroupChat && tempUri) {
        const downloadURL = await uploadImageToDBForGroup(tempUri, chatId)
        if (downloadURL) {
          setGroupImage(tempUri)
        }
      } else if (!isGroupChat && tempUri) {
        const downloadURL = await uploadImageToDB(tempUri, uid)
        if (downloadURL) {
          setImage(tempUri)
        }
      }
    } catch (error) {
      console.log(error)
      Alert.alert(
        'Error',
        'Something went wrong while updating your profile picture'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Determine if the image should be editable based on isGroupChat
  const isEditable = isGroupChat || (!isGroupChat && !photoURL)

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {isLoading ? (
        <ActivityIndicator size='large' color='cyan' />
      ) : (
        <TouchableOpacity
          onPress={isEditable ? launchImagePicker : undefined}
          style={{
            position: 'relative',
            borderWidth: 2,
            borderColor: 'cyan',
            borderRadius: 9999
          }} // Using a large border radius to create a circle
        >
          {!isGroupChat && (
            <Image
              style={{ width: 96, height: 96, borderRadius: 9999 }} // Using a large border radius to match the parent's border radius
              source={
                image ? { uri: image } : require('../assets/userImage.jpeg')
              }
            />
          )}

          {isGroupChat && (
            <Image
              style={{ width: 96, height: 96, borderRadius: 9999 }} // Using a large border radius to match the parent's border radius
              source={
                groupImage
                  ? { uri: groupImage }
                  : require('../assets/userImage.jpeg')
              }
            />
          )}

          {isEditable && (
            <View
              style={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                borderRadius: 12,
                padding: 2,
                backgroundColor: 'white'
              }}
            >
              <FontAwesome name='pencil-square-o' size={20} color='grey' />
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}
