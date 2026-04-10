import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    countUnder20DueDays: 0,
};

const dueDaysSlice = createSlice({
    name: 'dueDays',
    initialState,
    reducers: {
        setCountUnder20DueDays: (state, action) => {
            state.countUnder20DueDays = action.payload;
        },
    },
});

export const { setCountUnder20DueDays } = dueDaysSlice.actions;
export default dueDaysSlice.reducer;
