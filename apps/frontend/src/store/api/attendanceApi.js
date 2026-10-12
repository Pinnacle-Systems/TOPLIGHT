import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@env';
import { SetHeader } from '../../utils/HeaderSet';

const ATT_BASE = `${API_URL}/attendance`;

const AttendanceApi = createApi({
    reducerPath: 'AttendanceApi',
    baseQuery: fetchBaseQuery({
        baseUrl: ATT_BASE,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['Att_Status', 'Att_History'],
    endpoints: (builder) => ({

        // GET /attendance/status — today's in/out times + status
        getAttendanceStatus: builder.query({
            query: () => ({ url: '/status', method: 'GET' }),
            providesTags: ['Att_Status'],
        }),

        // GET /attendance/summary — monthly punch summary
        getAttendanceSummary: builder.query({
            query: () => ({ url: '/summary', method: 'GET' }),
            providesTags: ['Att_Status'],
        }),

        // GET /attendance/history — historical records
        getAttendanceHistory: builder.query({
            query: (params) => ({ url: '/history', method: 'GET', params }),
            providesTags: ['Att_History'],
        }),

        // POST /attendance/punch-in
        punchIn: builder.mutation({
            query: (body) => ({
                url: '/punch-in',
                method: 'POST',
                body,
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Att_Status'],
        }),

        // PUT /attendance/punch-out
        punchOut: builder.mutation({
            query: (body) => ({
                url: '/punch-out',
                method: 'PUT',
                body,
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Att_Status'],
        }),
    }),
});

export const {
    useGetAttendanceStatusQuery,
    useGetAttendanceSummaryQuery,
    useGetAttendanceHistoryQuery,
    usePunchInMutation,
    usePunchOutMutation,
} = AttendanceApi;

export default AttendanceApi;
