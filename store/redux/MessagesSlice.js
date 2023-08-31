import { createSlice } from '@reduxjs/toolkit'

const MessagesSlice = createSlice({
  name: 'Messages',
  initialState: {
    chatMessages: {},
    messagesArray: []
  },
  reducers: {
    setChatMessages (state, action) {
      const initialMessages = state.chatMessages
      const { chatId, messagesData } = action.payload
      initialMessages[chatId] = messagesData
      state.userChats = initialMessages
    },
    setMessagesArray (state, action) {
      state.messagesArray = action.payload
    }
  }
})

export const { setChatMessages, setMessagesArray } = MessagesSlice.actions

export default MessagesSlice.reducer
