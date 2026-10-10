import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL as BASE_URL } from '@env';
import { SetHeader } from "../../utils/HeaderSet";


const LeaveData = createApi({
    reducerPath: 'Leave',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['Leave'],
    endpoints: (builder) => ({
        getCurrent_FinYear: builder.query({
            query: () => {
                return {
                    url: Leave+"/get_Current_Fin_Year",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['get_current_FinYear'],
        }),
        add_requestLeave:builder.mutation({
                            query: (payload) => ({
                                url: Leave+"/add_requestLeave",
                                method: "POST",
                                body: payload,
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["add_requestLeave"],
                        }),
                        getHod_showable_data: builder.query({
                                    query: ({params}) => {
                                        return {
                                            url:Leave,
                                            method: 'GET',
                                            headers: {
                                                'Content-type': 'application/json; charset=UTF-8',
                                            },params
                                        }
                                    },
                                    providesTags: ['getHod_showable_data'],
                                }),
  getDocID: builder.query({
            query: () => {
                return {
                    url:Leave+"/getDocId",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['DocID_Leave'],
        }),
         get_Lcode:builder.query({
                            query: (payload) => ({
                                url: Leave+"/get_Lcode",
                                method:"GET",
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["get_Lcode"],
                        }),
                        requestLeave_Approval:builder.mutation({
                            query: (payload) => ({
                                url: Leave+"/requestLeave_Approval",
                                method: "POST",
                                body: payload,
                                params:payload?.params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["requestLeave_approval"],
                        }),
                        get_leave_available:builder.query({
                            query: (payload) => ({
                                url: Leave+"/get_leave_available",
                                method:"GET",
                                params:payload,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["get_leave_available"],
                        }),
                        get_lcode_leave_available:builder.query({
                            query: (payload) => ({
                                url: Leave+"/get_lcode_leave_available",
                                method:"GET",
                                params:payload,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                            }),
                            invalidatesTags: ["get_lcode_leave_available"],
                        }),
                         get_leaves:builder.query({
                            query: (params) => ({
                                url: Leave+"/getLeaves",
                                method:"GET",
                                params,
                                headers: {
                                    "Content-type": "application/json; charset=UTF-8",
                                },
                                
                            }),
                            invalidatesTags: ["get_leaves"],
                        })
       
    }),
    
})

export const {
    useGetCurrent_FinYearQuery,
    useGet_LcodeQuery,
    useAdd_requestLeaveMutation,
    useGetDocIDQuery,
    useRequestLeave_ApprovalMutation,
    useGetHod_showable_dataQuery,
    useGet_leave_availableQuery,
    useLazyGet_leave_availableQuery,
    useLazyGet_lcode_leave_availableQuery,
    useGet_leavesQuery 
    
} = LeaveData;

export default LeaveData;
