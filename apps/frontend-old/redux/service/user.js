import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, LOGIN_API, UserDetails, USERS_API } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";

const UsersApi = createApi({
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
        "Users", "UsersDetails", "get_Change_Settings", "Login", "UsersCreate", 
        "ImageUpload", "getUserImage", "token_fcm_hod", "get_refresh_token", 
        "token_fcm", "Otp", "/change_password", "get_Hod_Details", "LoginLogs", 
        "UsersDes", "UsersRole", "createRoleOnPage", "UpdateRoleonPage", 
        "/getUserBasicDetails"
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
            query: () => {

                return {
                    url: USERS_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["Users"],
        }),getUsersDetails: builder.query({
            query: () => {
                return {
                    url: UserDetails,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["UsersDetails"],
        }),
        getUserDet: builder.query({
            query: () => {

                return {
                    url: `${USERS_API}/getUserDet`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["Users"],
        }),getUserBasicDetails:builder.query({
            query: ({Idcard,ismul}) => {
                return {
                    url: `${USERS_API}/getUserBasicDetails`,
                    method: "GET",
                    params:{Idcard,ismul},
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["/getUserBasicDetails"],
        }),
        getDesignation: builder.query({
            query: () => {

                return {
                    url: `${USERS_API}/getDesignation`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },

                };
            },
            providesTags: ["UsersDes"],
        }),
        getRolesOnPage: builder.query({
            query: ( params ) => {

                return {
                    url: `${USERS_API}/getRolesOnPage`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        }),getUserRolesOnPage:builder.query({
            query: ( params ) => {

                return {
                    url: `${USERS_API}/getUserRolesOnPage`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        }),getCreatedRolesOnPage:builder.query({
            query: ( params ) => {

                return {
                    url: `${USERS_API}/getCreatedRolesOnPage`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        }),
        createRoleOnPage: builder.mutation({
            query: (payload) => ({
                url: USERS_API + "/createRoleOnPage",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["createRoleOnPage"],
        }),
        UpdateRoleOnPage:
        builder.mutation({
            query: (payload) => ({
                url: USERS_API + "/UpdateRoleOnPage",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UpdateRoleonPage"],
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
            invalidatesTags: ["UsersCreate","UsersDetails"],
        }),
        update_user_fcm: builder.mutation({
            query: (payload) => ({
                url: USERS_API+"/update_fcm",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            }),
            invalidatesTags: ["UsersCreate"],
        }),
        UploadImage: builder.mutation({
            query: (payload) => ({
                url: USERS_API+"/upload",
                method: "POST",
                body: payload,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                
            }),
            invalidatesTags: ["ImageUpload"],
        }),getUserImage:builder.query({
            query: (ID) => {

                return {
                    url: `${USERS_API}/getUserImage/${ID}`,
                    method: "GET",
                       
                };
            },
            providesTags: ["getUserImage"],
        }),get_hod_token:builder.query({
            query: ({params}) => {

                return {
                    url: `${USERS_API}/get_hod_token`,
                    method: "GET",
                    params
                       
                };
            },
            providesTags: ["token_fcm_hod"],
        }),get_refresh_token:builder.query({
            query: (params) => {

                return {
                    url: `${USERS_API}/get_refresh_token`,
                    method: "GET",
                    params
                       
                };
            },
            providesTags: ["get_refresh_token"],
        }),
        getCompanycode: builder.query({
            query: (params) => {

                return {
                    url: `${USERS_API}/getCompanyCode`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        }), getEmployeeids: builder.query({
            query: (params) => {

                return {
                    url: `${USERS_API}/getEmployeeIds`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        }),get_fcm_token:builder.query({
            query: ({params}) => {
                return {
                    url: `${USERS_API}/get_fcm_token`,
                    method: "GET",
                    params
                       
                };
            },
            providesTags: ["token_fcm"],
        }),
        send_Otp:builder.mutation({
            query: (payload) => ({
                url: USERS_API+"/send_Otp",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                
            }),
            invalidatesTags: ["Otp"],
        }),change_password:builder.mutation({
            query: (payload) => ({
                url: USERS_API+"/change_password",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                
            }),
            invalidatesTags: ["/change_password"],
        }),
        Change_Settings:builder.mutation({
            query: (payload) => ({
                url: USERS_API+"/Change_Settings",
                method: "POST",
                body: payload,
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
                
            }),
            invalidatesTags: ["get_Change_Settings"],
        }),
          get_Change_Settings:builder.query({
            query: ({params}) => {
                return {
                    url: `${USERS_API}/get_Change_Settings`,
                    method: "GET",
                    params
                       
                };
            },
            providesTags: ["get_Change_Settings"],
        }),get_Hod_Details:builder.query({
            query: ({params}) => {
                return {
                    url: `${USERS_API}/get_Hod_Details`,
                    method: "GET",
                    params
                       
                };
            },
            providesTags: ["get_Hod_Details"],
        }),
        getLoginLogs:builder.query({
            query: ( params ) => {

                return {
                    url: `${USERS_API}/LoginLogs`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["LoginLogs"],
        }),
        getEmployeeIdsWithAtt: builder.query({
            query: (params) => {

                return {
                    url: `${USERS_API}/getEmployeeIdsWithAtt`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params,
                };
            },
            providesTags: ["UsersRole"],
        })




    }),
});

export const {
    useLoginUserMutation,
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUserDetQuery,
    useGetDesignationQuery,
    useGetRolesOnPageQuery,
    useCreateRoleOnPageMutation,
    useGetUserBasicDetailsQuery,
    useGetUsersDetailsQuery,
    useUpdateRoleOnPageMutation,
    useUploadImageMutation,
    useGetUserImageQuery,
    useGetCompanycodeQuery,
    useGetEmployeeidsQuery,
    useUpdate_user_fcmMutation,
    useGet_hod_tokenQuery,
    useGet_refresh_tokenQuery,
    useGet_fcm_tokenQuery,
    useSend_OtpMutation,
    useChange_passwordMutation,
    useGetUserRolesOnPageQuery,
    useGetCreatedRolesOnPageQuery,
    useChange_SettingsMutation,
    useGet_Change_SettingsQuery,
    useGet_Hod_DetailsQuery,
    useGetLoginLogsQuery,
    useGetEmployeeIdsWithAttQuery

} = UsersApi;

export default UsersApi;
