import { createSlice } from '@reduxjs/toolkit';
const initialState = {

    pages: [],
}
const authSlice = createSlice({
    name: 'perm',
    initialState,
    reducers: {
        setUser: (state, action) => {
            console.log(state, 'state')


            state.pages = action.payload.pages
        },
        // other reducers like logout
    }
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
