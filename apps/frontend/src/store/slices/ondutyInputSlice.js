import { createSlice } from '@reduxjs/toolkit';

/**
 * Local form state for the Onduty entry screen.
 * Keeps form data isolated from global UserDetails slice.
 */
const initialState = {
    // Form fields
    docid: '',
    docdate: '',
    idcard: '',
    empname: '',
    category: '',       // selected reason ID
    others: '',         // free-text reason
    address: '',        // auto-filled location address
    vechileno: '',      // selected vehicle number
    start_km: '',       // Starting KM
    end_km: '',         // Ending KM on check-out
    reached_km: '',     // Reached KM on return

    // Setting toggle: when true, show KM / vehicle entry options on OnDuty
    isKmEntryEnabled: false,

    // Dropdown source data
    category_options: [],       // [{id, name}] from API
    category_vechileno: [],     // [{vechileno, vechilename}] from API

    // Location coords (stored in slice so hooks can read them)
    latitude: 0,
    longitude: 0,
};

const ondutyInputSlice = createSlice({
    name: 'ondutyInput',
    initialState,
    reducers: {
        setOndutyField: (state, action) => {
            return { ...state, ...action.payload };
        },
        setKmEntryEnabled: (state, action) => {
            state.isKmEntryEnabled = Boolean(action.payload);
        },
        resetOndutyForm: (state) => {
            // Preserve isKmEntryEnabled setting across resets
            const kmSetting = state.isKmEntryEnabled;
            const categoryOptions = state.category_options;
            return { ...initialState, isKmEntryEnabled: kmSetting, category_options: categoryOptions };
        },
        setOndutyLocation: (state, action) => {
            state.latitude = action.payload.latitude;
            state.longitude = action.payload.longitude;
            state.address = action.payload.address;
        },
        setOndutyOptions: (state, action) => {
            if (action.payload.category_options) {
                state.category_options = action.payload.category_options;
            }
            if (action.payload.category_vechileno) {
                state.category_vechileno = action.payload.category_vechileno;
            }
        },
        setOndutyDocId: (state, action) => {
            state.docid = action.payload.docid;
            state.docdate = action.payload.docdate;
            state.idcard = action.payload.idcard;
            state.empname = action.payload.empname;
        },
    },
});

export const {
    setOndutyField,
    setKmEntryEnabled,
    resetOndutyForm,
    setOndutyLocation,
    setOndutyOptions,
    setOndutyDocId,
} = ondutyInputSlice.actions;

export default ondutyInputSlice.reducer;
