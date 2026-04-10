import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Notifi, Permission, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const NotificationRTk = createApi({
    reducerPath: 'NotificationRTk',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['NotificationRTk'],
    endpoints: (builder) => ({
        getPermissionRequest: builder.query({
            query: ({params}) => {
                return {
                    url:Notifi+"/getPermissionRequest",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                    params
                }
            },
            providesTags: ['getPermissionRequest'],
        }),

        requestPermission:builder.mutation({
                    query: (payload) => ({
                        url: Permission+"/requestPermission",
                        method: "POST",
                        body: payload,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                    }),
                    invalidatesTags: ["requestPermission"],
                })

    }),
})

export const {
    useGetPermissionRequestQuery
} = NotificationRTk;

export default NotificationRTk;