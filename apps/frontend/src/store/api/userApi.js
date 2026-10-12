import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";
import { SetHeader } from "../../utils/HeaderSet";

const BASE_URL = API_URL;
const USERS_API = "/users";
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
        "Login", "Users", "UsersDetails", "UsersRole", "UsersDes", 
        "createRoleOnPage", "UpdateRoleonPage", "UsersCreate", "get_Change_Settings"
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
        getUserDet: builder.query({
            query: () => ({
                url: `${USERS_API}/getUserDet`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            providesTags: ["Users"],
        }),
        getUserBasicDetails: builder.query({
            query: ({ Idcard, ismul } = {}) => ({
                url: `${USERS_API}/getUserBasicDetails`,
                method: "GET",
                params: { Idcard, ismul },
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            providesTags: ["UsersDetails"],
        }),
        getDesignation: builder.query({
            query: () => ({
                url: `${USERS_API}/getDesignation`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            providesTags: ["UsersDes"],
        }),
        getRolesOnPage: builder.query({
            query: (params) => ({
                url: `${USERS_API}/getRolesOnPage`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                params,
            }),
            providesTags: ["UsersRole"],
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
        getCreatedRolesOnPage: builder.query({
            query: (params) => ({
                url: `${USERS_API}/getCreatedRolesOnPage`,
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                params,
            }),
            providesTags: ["UsersRole"],
        }),
        createRoleOnPage: builder.mutation({
            query: (payload) => ({
                url: `${USERS_API}/createRoleOnPage`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["createRoleOnPage", "UsersRole"],
        }),
        updateRoleOnPage: builder.mutation({
            query: (payload) => ({
                url: `${USERS_API}/UpdateRoleOnPage`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UpdateRoleonPage", "UsersRole"],
        }),
        UpdateRoleOnPage: builder.mutation({
            query: (payload) => ({
                url: `${USERS_API}/UpdateRoleOnPage`,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UpdateRoleonPage", "UsersRole"],
        }),
        createUser: builder.mutation({
            query: (payload) => ({
                url: USERS_API,
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UsersCreate", "UsersDetails", "Users"],
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
        getEmployeeids: builder.query({
            query: (params) => ({
                url: `${USERS_API}/getEmployeeIds`,
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
            query: ({ params } = {}) => ({
                url: `${USERS_API}/get_Change_Settings`,
                method: "GET",
                params
            }),
            providesTags: ["get_Change_Settings"],
        }),
        get_hod_token: builder.query({
            query: ({ params } = {}) => ({
                url: `${USERS_API}/get_hod_token`,
                method: "GET",
                params,
            }),
            providesTags: ["UsersDetails"],
        }),
        get_refresh_token: builder.query({
            query: (params) => ({
                url: `${USERS_API}/get_refresh_token`,
                method: "GET",
                params,
            }),
            providesTags: ["UsersDetails"],
        }),
    }),
});

export const {
    useLoginUserMutation,
    useGetUsersQuery,
    useGetUserDetQuery,
    useGetUserBasicDetailsQuery,
    useGetDesignationQuery,
    useGetRolesOnPageQuery,
    useGetUserRolesOnPageQuery,
    useGetCreatedRolesOnPageQuery,
    useCreateRoleOnPageMutation,
    useUpdateRoleOnPageMutation,
    useCreateUserMutation,
    useGetCompanycodeQuery,
    useGetEmployeeidsQuery,
    useUpdate_user_fcmMutation,
    useGet_Change_SettingsQuery,
    useGet_hod_tokenQuery,
    useGet_refresh_tokenQuery,
} = UsersApi;

export default UsersApi;
