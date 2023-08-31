import React from 'react'
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'

export default function ChatBubbleImage (props) {
  const { image } = props

  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <View className='flex items-center justify-center w-full h-56 pb-4'>
      {isLoading && (
        <View className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'>
          <ActivityIndicator size='large' color='#0891b2' />
        </View>
      )}
      <Image
        source={{ uri: image }}
        className='h-full w-48 rounded-lg'
        resizeMode='cover'
        onLoad={() => setIsLoading(false)}
      />
    </View>
  )
}
