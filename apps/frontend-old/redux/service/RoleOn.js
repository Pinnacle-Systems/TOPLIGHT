import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Role, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const RoleOnSevices = createApi({
    reducerPath: 'RoleOn',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['RoleOnPage','get_all_role'],
    endpoints: (builder) => ({
        addRole_master:builder.mutation({
                    query: (payload) => ({
                        url: Role+"/create_role_master",
                        method: "POST",
                        body: payload,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                    }),
                    invalidatesTags: ["get_all_role"],
                }),
         get_all_role:builder.query({
            query: (params) => {
                return {
                    url:Role+"/get_all_role",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },params
                }
            },
            providesTags: ['get_all_role'],
        }),

    }),
})

export const {
    useAddRole_masterMutation,
    useGet_all_roleQuery
} = RoleOnSevices

export default RoleOnSevices;