import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    _id: null,
    user: null,
    token: null,
    userName: null,
    lastLoggedIn: null,
    userRole: null,
    permissions: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, lastLoggedIn } = action.payload;
      state.user = user;
      state.token = token;
      state._id = user._id;
      state.userName = user.userName;
      state.lastLoggedIn = lastLoggedIn;
      state.userRole = user.roleName;
      state.permissions = user.permissions;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state._id = null;
      state.userName = null;
      state.lastLoggedIn = null;
      state.userRole = null;
      state.permissions = null;
    },
    updateUser: (state, action) => {
      const updatedUser = action.payload;
      state.user = updatedUser;
      state.userName = updatedUser.userName;
      state.userRole = updatedUser.roleName;
      state.permissions = updatedUser.permissions;
    },
    updateUserProfile: (state, action) => {
      const updatedUser = action.payload;
      state.user = updatedUser;
      state.userName = updatedUser.userName;
      state.userRole = updatedUser.roleName;
      state.permissions=state.permissions
    },
  },
});

export const { setCredentials, setLogout, updateUser,updateUserProfile } = authSlice.actions;
export default authSlice.reducer;

