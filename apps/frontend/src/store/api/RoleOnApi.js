import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";
import { SetHeader } from "../../utils/HeaderSet";

const BASE_URL = API_URL;

export const RoleOnApi = createApi({
    reducerPath: 'RoleOn',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['RoleOnPage', 'get_all_role'],
    endpoints: (builder) => ({
        addRole_master: builder.mutation({
            query: (payload) => ({
                url: "/role/create_role_master",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["get_all_role"],
        }),
        get_all_role: builder.query({
            query: (params) => ({
                url: "/role/get_all_role",
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                params,
            }),
            providesTags: ['get_all_role'],
        }),
    }),
});

export const {
    useAddRole_masterMutation,
    useGet_all_roleQuery,
} = RoleOnApi;

export default RoleOnApi;
