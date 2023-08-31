import { configureStore } from '@reduxjs/toolkit'
import authSlice from './redux/authSlice'
import userDataSlice from './redux/userDataSlice'
import userChatsSlice from './redux/chatSlice'
import MessagesSlice from './redux/MessagesSlice'

export const Store = configureStore({
  reducer: {
    auth: authSlice,
    userData: userDataSlice,
    userChats: userChatsSlice,
    Messages: MessagesSlice
  }
})
