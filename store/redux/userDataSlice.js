import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userFormData: {
    firstName: '',
    lastName: '',
    about: '',
    phone: '',
    email: '',
    password: ''
  },
  //below 5 are must required fields
  formErrors: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  },
  isLoading: false
}

const userDataFormSlice = createSlice({
  name: 'userFormData',
  initialState,
  reducers: {
    setUserFormData (state, action) {
      state.userFormData = action.payload
    },
    setFormErrors (state, action) {
      state.formErrors = action.payload
    },
    setIsLoading (state, action) {
      state.isLoading = action.payload
    }
  }
})

export const { setUserFormData, setIsLoading, setFormErrors } =
  userDataFormSlice.actions

export default userDataFormSlice.reducer
