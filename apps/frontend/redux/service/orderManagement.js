import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ORD_MANAGEMENT, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const ordManagement = createApi({
    reducerPath: 'ordManagement',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['ordManagement'],
    endpoints: (builder) => ({
        getOrdManagementData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getShippedData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getShippedData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getOcrPending: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getOcrPending`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getWIPData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getWIPData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getPreBudget: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getPreBudget`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getProfitLossData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getProfitLossData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getCapPlanData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getCapPlanData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getFabStsData: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getFabStsData`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getYFActVsPln: builder.query({
            query: ({ params }) => {
                return {
                    url: `${ORD_MANAGEMENT}/getYFActVsPln`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['ordManagement'],
        }),
        getOrderStsBuyerWise: builder.query({
            query: ({ params }) => {
                return {
                    url: ORD_MANAGEMENT + "/orderStsBuyerWise",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                    params
                }
            },
            providesTags: ['ordManagement'],
        }),
        getPlanedVsActualSales: builder.query({
            query: ({ params }) => {
                return {
                    url: ORD_MANAGEMENT + "/plannedVsActualSalesval",
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                    params
                }
            },
            providesTags: ['ordManagement'],
        }),
    }),
})

export const {
    useGetOrdManagementDataQuery,
    useGetShippedDataQuery,
    useGetOcrPendingQuery,
    useGetWIPDataQuery,
    useGetProfitLossDataQuery,
    useGetCapPlanDataQuery,
    useGetFabStsDataQuery,
    useGetYFActVsPlnQuery,
    useGetPreBudgetQuery,
    useGetOrderStsBuyerWiseQuery,
    useGetPlanedVsActualSalesQuery,
} = ordManagement;

export default ordManagement;