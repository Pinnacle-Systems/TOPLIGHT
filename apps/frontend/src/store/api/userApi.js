import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";
import { SetHeader } from "../../utils/HeaderSet";

const BASE_URL = API_URL;
const USERS_API = "/users"; // Assuming this based on old code
const LOGIN_API = "/users/login";

export const UsersApi = createApi({
    reducerPath: "loginUser",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        timeout: 15000,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        }
    }),
    tagTypes: [
        "Login", "Users", "UsersDetails", "UsersRole", "get_Change_Settings"
    ],
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (payload) => ({
                url: LOGIN_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Login"],
        }),
        getUsers: builder.query({
            query: () => ({
                url: USERS_API,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            providesTags: ["Users"],
        }),
        getUserRolesOnPage: builder.query({
            query: (params) => ({
                url: `${USERS_API}/getUserRolesOnPage`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                params,
            }),
            providesTags: ["UsersRole"],
        }),
        getCompanycode: builder.query({
            query: (params) => ({
                url: `${USERS_API}/getCompanyCode`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                params,
            }),
            providesTags: ["UsersRole"],
        }),
        update_user_fcm: builder.mutation({
            query: (payload) => ({
                url: `${USERS_API}/update_fcm`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["Login"],
        }),
        get_Change_Settings: builder.query({
            query: ({ params }) => ({
                url: `${USERS_API}/get_Change_Settings`,
                method: "GET",
                params
            }),
            providesTags: ["get_Change_Settings"],
        }),
    }),
});

export const {
    useLoginUserMutation,
    useGetUsersQuery,
    useGetUserRolesOnPageQuery,
    useGetCompanycodeQuery,
    useUpdate_user_fcmMutation,
    useGet_Change_SettingsQuery,
} = UsersApi;

export default UsersApi;
