import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL as BASE_URL } from '@env';
import { SetHeader } from "../../utils/HeaderSet";

const PERMISSION_BASE = "/Permission";

export const permissionApi = createApi({
    reducerPath: 'permissionApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['Permission', 'get_all_Permission_reason', 'get__per_category', 'requestPermission'],
    endpoints: (builder) => ({
        getDocID: builder.query({
            query: () => ({
                url: `${PERMISSION_BASE}/getDocId`,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            }),
            providesTags: ['Permission'],
        }),
        get__per_category: builder.query({
            query: (params) => ({
                url: `${PERMISSION_BASE}/get__per_category`,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                params,
            }),
            providesTags: ['get__per_category'],
        }),
        get_all_Permission_reason: builder.query({
            query: (params) => ({
                url: `${PERMISSION_BASE}/get_all_Permission_reason`,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                params,
            }),
            providesTags: ['get_all_Permission_reason'],
        }),
        addPermission_Master: builder.mutation({
            query: (payload) => ({
                url: `${PERMISSION_BASE}/addPermission_Master`,
                method: "POST",
                body: payload,
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["get_all_Permission_reason"],
        }),
        requestPermission: builder.mutation({
            query: (payload) => ({
                url: `${PERMISSION_BASE}/requestPermission`,
                method: "POST",
                body: payload,
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["requestPermission"],
        }),
        requestPermission_Approval: builder.mutation({
            query: (payload) => ({
                url: `${PERMISSION_BASE}/requestPermission_Approval`,
                method: "POST",
                body: payload,
                params: payload?.params,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["requestPermission"],
        }),
        getHod_showable_data: builder.query({
            query: ({ params } = {}) => ({
                url: PERMISSION_BASE,
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                params,
            }),
            providesTags: ['Permission'],
        }),
    }),
});

export const {
    useGetDocIDQuery,
    useGet__per_categoryQuery,
    useGet_all_Permission_reasonQuery,
    useAddPermission_MasterMutation,
    useRequestPermissionMutation,
    useRequestPermission_ApprovalMutation,
    useGetHod_showable_dataQuery,
} = permissionApi;

export default permissionApi;
