import { createSlice } from '@reduxjs/toolkit';
import { AllInputGroup } from '../States';



const inputsHandler = createSlice({
    name: 'InpuGroup',
    initialState:AllInputGroup,
    reducers: {
        setInput: (state, action) => {
            const { id, ...rest } = action.payload;
            if (!state[id]) state[id] = {};
            Object.assign(state[id], rest);
          },
        
    },
});

export const { setInput } = inputsHandler.actions;
export default inputsHandler?.reducer
