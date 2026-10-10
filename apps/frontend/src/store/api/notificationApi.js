import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@env";
import { SetHeader } from "../../utils/HeaderSet";

const BASE_URL = API_URL;
const Notifi = "/notification"; // Assumed endpoint based on standard patterns

export const NotificationApi = createApi({
    reducerPath: 'NotificationRTk',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['NotificationRTk', 'getPermissionRequest'],
    endpoints: (builder) => ({
        getPermissionRequest: builder.query({
            query: ({params}) => ({
                url: Notifi + "/getPermissionRequest",
                method: 'GET',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                params
            }),
            providesTags: ['getPermissionRequest'],
        }),
    }),
});

export const { useGetPermissionRequestQuery } = NotificationApi;
export default NotificationApi;
