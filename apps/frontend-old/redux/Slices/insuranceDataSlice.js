import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    tableData: [],
};

const tableData = createSlice({
    name: 'dueDays',
    initialState,
    reducers: {
        setTableData: (state, action) => {
            state.tableData = action.payload;
        },
    },
});

export const { setTableData } = tableData.actions;
export default tableData.reducer;
