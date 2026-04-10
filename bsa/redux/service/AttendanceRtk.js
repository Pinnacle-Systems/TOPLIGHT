// AttendanceRtk.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { attendance, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";

const AttendanceRTk = createApi({
  reducerPath: "AttendanceRTk",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      await SetHeader(headers);   // ← already sets compcode, idcard, username
      return headers;
    },
  }),
  tagTypes: ["Attendance_Status", "Attendance_Session", "Attendance_History"],
  endpoints: (builder) => ({

    // GET /attendance/status
    getAttendanceStatus: builder.query({
      query: () => ({
        url: attendance + "/status",
        method: "GET",
      }),
      providesTags: ["Attendance_Status"],
    }),

    // GET /attendance/history
    getAttendanceHistory: builder.query({
      query: (params) => ({
        url: attendance + "/history",
        method: "GET",
        params,                   // date range etc.
      }),
      providesTags: ["Attendance_History"],
    }),

    // POST /attendance/punch-in
    punchIn: builder.mutation({
      query: (body) => ({
        url: attendance + "/punch-in",
        method: "POST",
        body,                     // { empname, latitude, longitude, location }
      }),
      invalidatesTags: ["Attendance_Status", "Attendance_Session"],
    }),

    // PUT /attendance/punch-out
    punchOut: builder.mutation({
      query: (body) => ({
        url: attendance + "/punch-out",
        method: "PUT",
        body,                     // { latitude, longitude, location }
      }),
      invalidatesTags: ["Attendance_Status", "Attendance_Session"],
    }),getPunchSummary: builder.query({
  query: () => ({
    url   : attendance + "/summary",
    method: "GET",
  }),
  providesTags: ["Attendance_Status"],   // auto-refetch after every punch
}),

  }),
});

export const {
  useGetAttendanceStatusQuery,
  useGetAttendanceHistoryQuery,
  usePunchInMutation,
   useGetPunchSummaryQuery, 
  usePunchOutMutation,
} = AttendanceRTk;

export default AttendanceRTk;