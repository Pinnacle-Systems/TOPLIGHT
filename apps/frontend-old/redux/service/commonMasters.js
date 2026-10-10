import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COMMON_MAST, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const commonMast = createApi({
    reducerPath: 'commonMast',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['commonMast','get_chat'],
    endpoints: (builder) => ({
        getFinYear: builder.query({
            query: () => {
                return {
                    url: COMMON_MAST,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['commonMast'],
        }),
        getBuyerName: builder.query({
            query: () => {
                return {
                    url: `${COMMON_MAST}/getBuyer`,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['commonMast'],
        }),
        getMonth: builder.query({
            query: ({ params }) => {
                return {
                    url: `${COMMON_MAST}/getMonth`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['commonMast'],
        }),
         getchat: builder.query({
            query: ( params ) => {
                return {
                    url: `${COMMON_MAST}/get_chat`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['get_chat'],
        }),
        getCompCodeData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${COMMON_MAST}/getCompCodeData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['commonMast'],
        }),
        delete_Common:builder.mutation({
                            query: (payload) => ({
                                url: `${COMMON_MAST}/delete`,
                                method: "POST",
                                body: payload,
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["common_delete"],
                        }),
                        
                         Addchat:builder.mutation({
                            query: (payload) => ({
                                url: `${COMMON_MAST}/chat`,
                                method: "POST",
                                body: payload,
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["get_chat"],
                        })
                        
                        ,
         update_Common:builder.mutation({
                            query: (payload) => ({
                                url: `${COMMON_MAST}/update`,
                                method: "POST",
                                body: payload,
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["update_delete"],
                        }),
    }),
})

export const {
    useGetFinYearQuery,
    useGetBuyerNameQuery,
    useGetMonthQuery,
    useGetCompCodeDataQuery,
    useUpdate_CommonMutation,
    useDelete_CommonMutation,
    useGetchatQuery,
    useAddchatMutation
    
} = commonMast;

export default commonMast;