import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Advance, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const AdvanceData = createApi({
    reducerPath: 'Advance',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['Advance'],
    endpoints: (builder) => ({

        add_requestAdvance: builder.mutation({
            query: (payload) => ({
                url: Advance + "/add_requestAdvance",
                method: "POST",
                body: payload,
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },

            }),
            invalidatesTags: ["add_requestAdvance"],
        }),
        get_Advance: builder.query({
            query: (payload) => ({
                url: Advance + "/get_Advance",
                method: "GET",
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },

            }),
            invalidatesTags: ["get_Advance"],
        }),
        getDocID: builder.query({
            query: () => {
                return {
                    url: Advance + "/getDocId",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['DocID_Advance'],
        }),
        requestLoan_Approval: builder.mutation({
            query: (payload) => ({
                url: Advance + "/requestAdvance_Approval",
                method: "POST",
                body: payload,
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },

            }),
            invalidatesTags: ["requestAdvance_approval"],
        }),

        getHod_showable_data: builder.query({
            query: ({ params }) => {
                return {
                    url: Advance,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    }, params
                }
            },
            providesTags: ['getHod_showable_advance_data'],
        }),
         get_Paycode_data: builder.query({
            query: ({ params }) => {
                return {
                    url: Advance+"/get_Paycode",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    }, params
                }
            },
            providesTags: ['get_Paycode_data'],
        }),
        

    }),

})



export const {
    useAdd_requestAdvanceMutation,
    useGet_AdvanceQuery,
    useGetDocIDQuery,
    useRequestLoan_ApprovalMutation,
    useGetHod_showable_dataQuery,
    useGet_Paycode_dataQuery
} = AdvanceData;

export default AdvanceData