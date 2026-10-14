import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    isAuthenticated: false,
  },
  reducers: {
    setUserdata: (state, action) => {
      // valid data milne par hi user authenticate ho
      if (action.payload) {
        state.userData = action.payload;
        state.isAuthenticated = true;
      } else {
        state.userData = null;
        state.isAuthenticated = false;
      }
    },
  },
});

export const { setUserdata } = userSlice.actions;
export default userSlice.reducer;
