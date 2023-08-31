import { createSlice } from '@reduxjs/toolkit'

const userChatsSlice = createSlice({
  name: 'userChatsData',
  initialState: {
    userChats: {},
    chatUsers: []
  },
  reducers: {
    setUserChats (state, action) {
      state.userChats = action.payload
    },
    setChatUsers (state, action) {
      // let newUsers = action.payload
      // let oldUsers = state.chatUsers
      // let users = [...oldUsers, ...newUsers]
      // let uniqueUsers = [...new Set(users)]
      // state.chatUsers = uniqueUsers

      state.chatUsers = state.chatUsers.concat(action.payload)
    }
  }
})

export const selectOtherUserData = (state, chatData) => {
  const otherUser = chatData?.users?.find(
    uid => uid !== state.auth.userData.uid
  )
  return state.userChats.chatUsers.find(user => user.uid === otherUser)
}

export const { setUserChats, setChatUsers } = userChatsSlice.actions

export default userChatsSlice.reducer
