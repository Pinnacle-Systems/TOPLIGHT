import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PO_REGISTER, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const poRegister = createApi({
    reducerPath: 'poRegister',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['PoRegister'],
    endpoints: (builder) => ({
        getPoRegister: builder.query({
            query: () => {
                return {
                    url: PO_REGISTER,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['PoRegister'],
        }),

    }),
})

export const {
    useGetPoRegisterQuery,
} = poRegister;

export default poRegister;