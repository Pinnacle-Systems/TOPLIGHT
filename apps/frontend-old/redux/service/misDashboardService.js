import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, MIS_DASHBOARD } from "../../constants/apiUrl";
import { SetHeader } from "./HeaderSet";

const MisDashboard = createApi({
  reducerPath: "MisDashboard",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      await SetHeader(headers);
      return headers;
    },
  }),
  tagTypes: [
    "MisDashboard",
    "getCommonData",
    "MisDashboadgetLastMonthSalary",
    "getYearWiseToTSalary",
    "getCurrentMonthLeaves",
    "getTotalHeadCount",
    "getCateogryToTSalary",
    "ToTexpenses",
    "getMonthESIPF",
    "getOverTime",
    "getMoreDetails",
    "getESI",
    "getOverTimeWages",
    "getEachOverTimeWages",
    "getUserMobData",
    "getINOUT",
    "getgendercount",
    "getTotalPA",
    "getPayslip",
    "filteremployee",
    "getDepData",
    "getDepWise_gender_attence",
    "getAllEmployees_By_GENDER_BY_DEPARTMENT",
  ],
  endpoints: (builder) => ({
    getMisDashboard: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getCommonData: builder.query({
      query: (params) => {
        return {
          url: "/getCommon",
          method: "POST",
          body: {
            table: params?.table,
            fields: params?.fields,
            where: params?.where,
            map: params?.map || "true",
          },
        };
      },
      providesTags: ["getCommonData"],
    }),
    getMisDashboardEmployeeDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/employeeDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardEmployeeDetail: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/employeeDetail",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    getMisDashboardSalaryDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/salaryDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    getMisDashboardOTWagesDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/otwagesdet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    getMisDashboardPfDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/pfDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardEsiDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/esiDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardAttDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/AttDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardNewjoin: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getNewjoin",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardAttDetTable: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/AttDetTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardRetDetTable: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/RetDetTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardAgeDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/AgeDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardExpDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/ExpDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardBgDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/BgDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardPfDataDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/PfDataDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardEsiDataDet: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/EsiDataDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardOrdersInHand: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/ordersInHand",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getSalaryAgewise: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/salaryAgewise",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    getAgewiseEsi: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/agewiseesi",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardOrdersInHandMonthWise: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/ordersInHandMonthWise",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getMisDashboardActualVsBudgetValueMonthWise: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/actualVsBudgetValueMonthWise",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getYearlyComp: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/yearlyComp",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    getRegioncount: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getregioncount",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),

    executeProcedure: builder.mutation({
      query: () => ({
        url: MIS_DASHBOARD + "/execute-procedure",
        method: "PUT",
      }),
    }),
    getBuyerWiseRevenue: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/buyerWiseRev",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getBudgetVsActual: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/actualVsBudget",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getShortShipmantRatio: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/shortShipment",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getEsiPf: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getESIPF",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getsalarydel: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/salaryDet1",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getEsiPf1: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getESIPF1",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getEsilastmonth: builder.query({
      query: () => {
        return {
          url: MIS_DASHBOARD + "/getEsilastmonth",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getsallastmonth: builder.query({
      query: () => {
        return {
          url: MIS_DASHBOARD + "/lastsalaryDet",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getEPFlastmonth: builder.query({
      query: () => {
        return {
          url: MIS_DASHBOARD + "/getPFlastmonth",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getLeaveAvb: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/leaveAvailable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getlongAbsent: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/LongAbsent",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getFullPrasent: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/FullPrasent",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getPayPeriod: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/PayPeriod",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getFinYear: builder.query({
      query: () => {
        return {
          url: MIS_DASHBOARD + "/finYear",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getHeadCount: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/headCount",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getHeadCountDetail: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/HeadDetail",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    getStateWiseHeadCount: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/stateWiseHeadCount",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["MisDashboard"],
    }),
    // Legacy Endpoints
    getLastMonthSalary: builder.query({
      query: ({ Idcard }) => {
        return {
          url: MIS_DASHBOARD + "/getLastMonthSalary",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params: { Idcard },
        };
      },
      providesTags: ["MisDashboadgetLastMonthSalary"],
    }),
    getYearWiseToTSalary: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getYearWiseToTSalary",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getYearWiseToTSalary"],
    }),
    getCurrentMonthLeaves: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getCurrentMonthLeaves",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getCurrentMonthLeaves"],
    }),
    getTotalHeadCount: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getTotalHeadCount",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getTotalHeadCount"],
    }),
    getCateogryToTSalary: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getCateogryToTSalary",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getCateogryToTSalary"],
    }),
    ToTexpenses: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/ToTexpenses",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["ToTexpenses"],
    }),
    getMonthESIPF: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getMonthESIPF",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getMonthESIPF"],
    }),
    getOverTime: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getOverTime",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getOverTime"],
    }),
    getMoreDetails: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getMoreDetails",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getMoreDetails"],
    }),
    getESI: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getESI",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getESI"],
    }),
    getOverTimeWages: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getOverTimeWages",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getOverTimeWages"],
    }),
    getEachOverTimeWages: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getEachOverTimeWages",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getEachOverTimeWages"],
    }),
    getUserMobData: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getUserMobData",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getUserMobData"],
    }),
    getInOut: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getInOut",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getINOUT"],
    }),
    getgendercount: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getgendercount",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getgendercount"],
    }),
    getTotalPA: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getTotalPA",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getTotalPA"],
    }),
    getPayslip: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getPayslip",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getPayslip"],
    }),
    getFilterEmployees: builder.query({
      query: ({ params }) => {
        return {
          url: MIS_DASHBOARD + "/getFilterEmployees",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["filteremployee"],
    }),
    getDepData: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getDepData",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getDepData"],
    }),
    getDepWise_gender_attence: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getDepWise_gender_attence",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getDepWise_gender_attence"],
    }),
    getAllEmployees_By_GENDER_BY_DEPARTMENT: builder.query({
      query: (params) => {
        return {
          url: MIS_DASHBOARD + "/getAllEmployees_By_GENDER_BY_DEPARTMENT",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["getAllEmployees_By_GENDER_BY_DEPARTMENT"],
    }),
  }),
});

export const {
  useGetMisDashboardQuery,
  useGetMisDashboardEmployeeDetQuery,
  useGetMisDashboardEmployeeDetailQuery,
  useGetMisDashboardSalaryDetQuery,
  useGetMisDashboardPfDetQuery,
  useGetMisDashboardEsiDetQuery,
  useGetMisDashboardAttDetQuery,
  useGetMisDashboardAttDetTableQuery,
  useGetMisDashboardRetDetTableQuery,
  useGetMisDashboardAgeDetQuery,
  useGetMisDashboardExpDetQuery,
  useGetMisDashboardBgDetQuery,
  useGetMisDashboardPfDataDetQuery,
  useGetMisDashboardEsiDataDetQuery,
  useGetMisDashboardOrdersInHandQuery,
  useGetMisDashboardOrdersInHandMonthWiseQuery,
  useGetMisDashboardActualVsBudgetValueMonthWiseQuery,
  useGetYearlyCompQuery,
  useExecuteProcedureMutation,
  useGetBuyerWiseRevenueQuery,
  useGetBudgetVsActualQuery,
  useGetShortShipmantRatioQuery,
  useGetEsiPfQuery,
  useGetEsiPf1Query,
  useGetLeaveAvbQuery,
  useGetlongAbsentQuery,
  useGetFullPrasentQuery,
  useGetPayPeriodQuery,
  useGetFinYearQuery,
  useGetHeadCountQuery,
  useGetHeadCountDetailQuery,
  useGetEsilastmonthQuery,
  useGetEPFlastmonthQuery,
  useGetRegioncountQuery,
  useGetMisDashboardOTWagesDetQuery,
  useGetSalaryAgewiseQuery,
  useGetAgewiseEsiQuery,
  useGetsallastmonthQuery,
  useGetsalarydelQuery,
  useGetMisDashboardNewjoinQuery,
  useGetStateWiseHeadCountQuery,
  // Legacy Hooks
  useGetYearWiseToTSalaryQuery,
  useGetLastMonthSalaryQuery,
  useGetCurrentMonthLeavesQuery,
  useGetCommonDataQuery,
  useGetTotalHeadCountQuery,
  useGetCateogryToTSalaryQuery,
  useToTexpensesQuery,
  useGetMonthESIPFQuery,
  useGetOverTimeQuery,
  useGetMoreDetailsQuery,
  useGetESIQuery,
  useGetOverTimeWagesQuery,
  useGetEachOverTimeWagesQuery,
  useGetUserMobDataQuery,
  useGetInOutQuery,
  useGetgendercountQuery,
  useGetTotalPAQuery,
  useGetFilterEmployeesQuery,
  useGetDepDataQuery,
  useGetDepWise_gender_attenceQuery,
  useGetAllEmployees_By_GENDER_BY_DEPARTMENTQuery,
  useGetPayslipQuery,
} = MisDashboard;

export default MisDashboard;