import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PO_DATA, BASE_URL } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";


const poData = createApi({
    reducerPath: 'poData',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes: ['poData'],
    endpoints: (builder) => ({
        getPoData: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}`,
                    method: 'GET',
                    params,
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                }
            },
            providesTags: ['getSupplier'],
        }),
        getFinYr: builder.query({
            query: () => {
                return {
                    url: `${PO_DATA}/getFinYr`,
                    method: 'GET',
                }
            }
        }),
        getSupplier: builder.query({
            query: () => {
                return {
                    url: `${PO_DATA}/getSupplier`,
                    method: 'GET',
                }
            }
        }),
        getArticleId: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getArticleId`,
                    method: 'GET',
                    params
                }
            }
        }),
        getSuppEfficency: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getSuppEfficency`,
                    method: 'GET',
                    params
                }
            }
        }),
        getTopItems: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getTopItems`,
                    method: 'GET',
                    params,
                }
            }
        }),
        getMonthlyReceivables: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getMonthlyReceivables`,
                    method: 'GET',
                    params
                }
            }
        }),
        getTopFiveSuppTurnOvr: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getTopFiveSuppTurnOvr`,
                    method: 'GET',
                    params
                }
            }
        }),
        getOverAllSupplierContribution: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getOverAllSupplierContribution`,
                    method: 'GET',
                    params
                }
            }
        }),
        getMostPaidTaxVal: builder.query({
            query: (params) => {
                return {
                    url: `${PO_DATA}/getMostPaidTaxVal`,
                    method: 'GET',
                    params
                }
            }
        })
    }),
})

export const {
    useGetPoDataQuery,
    useGetFinYrQuery,
    useGetSupplierQuery,
    useGetArticleIdQuery,
    useGetSuppEfficencyQuery,
    useGetTopItemsQuery,
    useGetMonthlyReceivablesQuery,
    useGetTopFiveSuppTurnOvrQuery,
    useGetOverAllSupplierContributionQuery,
    useGetMostPaidTaxValQuery
} = poData;

export default poData;