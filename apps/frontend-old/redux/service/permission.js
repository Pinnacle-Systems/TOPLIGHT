import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Permission, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const PermissionEntry = createApi({
    reducerPath: 'PermissionEntry',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['PermissionEntry'],
    endpoints: (builder) => ({
        getDocID: builder.query({
            query: () => {
                return {
                    url:Permission+"/getDocId",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['Permission'],
        }),
        
        get__per_category:builder.query({
            query: (params) => {
                return {
                    url:Permission+"/get__per_category",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },params
                }
            },
            providesTags: ['get__per_category'],
        })
        ,getHod_showable_data: builder.query({
            query: ({params}) => {
                return {
                    url:Permission,
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },params
                }
            },
            providesTags: ['getHod_showable_permission_data'],
        }),

        requestPermission:builder.mutation({
                    query: (payload) => ({
                        url: Permission+"/requestPermission",
                        method: "POST",
                        body: payload,
                        params:payload?.params,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                    }),
                    invalidatesTags: ["requestPermission"],
                }),

                requestPermission_Approval:builder.mutation({
                    query: (payload) => ({
                        url: Permission+"/requestPermission_Approval",
                        method: "POST",
                        body: payload,
                        params:payload?.params,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                    }),
                    invalidatesTags: ["requestPermission_approval"],
                }),
                addPermission_Master:builder.mutation({
                    query: (payload) => ({
                        url: Permission+"/addPermission_Master",
                        method: "POST",
                        body: payload,
                        params:payload?.params,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                    }),
                    invalidatesTags: ["addPermission_Master"],
                }),
                get_all_Permission_reason: builder.query({
            query: (params) => {
                return {
                    url:Permission+"/get_all_Permission_reason",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },params
                }
            },
            providesTags: [' get_all_Permission_reason'],
        }),

    }),
})

export const {
    useGetDocIDQuery,
    useRequestPermissionMutation,
    useRequestPermission_ApprovalMutation,
    useGetHod_showable_dataQuery,
    useGet__per_categoryQuery,
    useAddPermission_MasterMutation,
    useGet_all_Permission_reasonQuery
} = PermissionEntry;

export default PermissionEntry;