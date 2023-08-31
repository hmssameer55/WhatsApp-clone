import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userToken: null,
  userData: null,
  didTryAutoLogin: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveUser: (state, action) => {
      const { payload } = action
      state.userToken = payload.userToken
      state.userData = payload.userData
    },
    setDidTryAtuoLogin: (state, action) => {
      state.didTryAutoLogin = true
    },
    logout: (state, action) => {
      state.userToken = null
      state.userData = null
      state.didTryAutoLogin = false
    }
  }
})

export const { saveUser, setDidTryAtuoLogin, logout } = authSlice.actions

export default authSlice.reducer
