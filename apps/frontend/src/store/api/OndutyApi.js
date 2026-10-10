import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL as BASE_URL } from '@env';
import { SetHeader } from "../../utils/HeaderSet";



const customFetchWithTimeout = async (input, init = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 890000); // 60 seconds timeout

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const OndutyRTk = createApi({
    reducerPath: 'OndutyRTk',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: async (headers) => {
            await SetHeader(headers);
            return headers;
        },
    }),
    tagTypes:  ['Onduty_DocID','Onduty_Session','get_reached','get_live_user','OndutyApproval','get__vechilekm','get_all_Onduty_reason', 'OndutyHodData',"addonduty_Master","get__Date_Wise_Fuel","get__Date_Wise_Fuel_Individual"], 
    endpoints: (builder) => ({
        ondutyRequest:builder.mutation({
                    query: (formdata) => ({
                        url: onduty+"/requestOnduty",
                        method: "POST",
                        body: formdata
                        
                }),
                    invalidatesTags: ["Onduty_DocID","Onduty_Session","get_live_user"],
                }),
           getDocID: builder.query({
                            query: () => {
                                return {
                                    url:onduty+"/getDocId",
                                    method: 'GET',
                                    headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                    },
                                }
                            },
                            providesTags: ['Onduty_DocID'],
                        }),
               getIn: builder.query({
                            query: () => {
                                return {
                                    url:onduty+"/getIn",
                                    method: 'GET',
                                    headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                    },
                                }
                            },
                            providesTags: ['Onduty_Session'],
                        }), getHod_showable_data: builder.query({
                                    query: ({ params }) => {
                                        return {
                                            url: onduty,
                                            method: 'GET',
                                            headers: {
                                                'Content-type': 'application/json; charset=UTF-8',
                                            }, params
                                        }
                                    },
                                    providesTags: ['OndutyHodData'],
                                }),requestOndutyOut:builder.mutation({
                                                    query: (payload) => ({
                                                        url: onduty+"/requestOndutyOut",
                                                        method: "POST",
                                                        body: payload,
                                                        params:payload?.params,
                                                        headers: {
                                                            "Content-type": "application/json; charset=UTF-8",
                                                        },
                                                        
                                                    }),
                                                  invalidatesTags:  ['Onduty_Session','get_reached', 'OndutyApproval', 'OndutyHodData','get__vechilekm']

                                       }),requestReachedOut:builder.mutation({
                                                    query: (payload) => ({
                                                        url: onduty+"/requestReachedOut",
                                                        method: "POST",
                                                        body: payload,
                                                        params:payload?.params,
                                                        headers: {
                                                            "Content-type": "application/json; charset=UTF-8",
                                                        },
                                                        
                                                    }),
                                                  invalidatesTags:  ['Onduty_Session','get_reached', 'OndutyApproval', 'OndutyHodData','get__vechilekm']

                                       }),
                                       addOnduty_master:builder.mutation({
                                    query: (payload) => ({
                                  url: onduty+"/addOnduty_master",
                             method: "POST",
                        body: payload,
                        params:payload?.params,
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        
                       }),
                     invalidatesTags: ["get_all_Onduty_reason","Onduty_Session"],
                       }),

                          requestOnduty_Approval:builder.mutation({
                                                    query: (payload) => ({
                                                        url: onduty+"/requestonduty_Approval",
                                                        method: "POST",
                                                        body: payload,
                                                        params:payload?.params,
                                                        headers: {
                                                            "Content-type": "application/json; charset=UTF-8",
                                                        },
                                                    }),
                                                   invalidatesTags:  ['Onduty_Session', 'OndutyApproval', 'OndutyHodData']

                                        }),stTrack:builder.mutation({
                                                    query: (payload) => ({
                                                        url: onduty+"/stTrack",
                                                        method: "POST",
                                                        body: payload,
                                                        params:payload?.params,
                                                        headers: {
                                                            "Content-type": "application/json; charset=UTF-8",
                                                        },
                                                        
                                                    }),
                                                   invalidatesTags:  []

                                       }),
             get_all_Onduty_reason: builder.query({
                              query: (params) => {
                                            return {
                                      url:onduty+"/get_all_Onduty_reason",
                                        method: 'GET',
                                           headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                     },params
                                     }
                                  },
                               providesTags: ['get_all_Onduty_reason'],
        }),get__vechilekm: builder.query({
                              query: (params) => {
                                            return {
                                      url:onduty+"/get__vechilekm",
                                        method: 'GET',
                                           headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                     },params
                                     }
                                  },
                               providesTags: ['get__vechilekm'],
        }),
        
    Add__vechilekm: builder.mutation({
                               query: (payload) => ({
                                   url: onduty+"/Add__vechilekm",
                                  method: "POST",
                                 body: payload,
                                  params:payload?.params,
                                           headers: {
                                               "Content-type": "application/json; charset=UTF-8",
                                               },
                                                        
                                        }),
                                    invalidatesTags:  ['get__vechilekm']

                                       })
        
        ,get__Onduty_edit:builder.query({
                              query: (params) => {
                                            return {
                                      url:onduty+"/get__Onduty_edit",
                                        method: 'GET',
                                           headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                     },params
                                     }
                                  },
                               providesTags: ['get_all_onduty'],
        }),get_history_location:builder.query({
                              query: (params) => {
                                            return {
                                      url:onduty+"/get_history_location",
                                        method: 'GET',
                                           headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                     },params
                                     }
                                  },
                               providesTags: ['get_history_location'],
        }),get_live_location:builder.query({
                              query: (params) => ({
                                           
                                          url:onduty+"/get_live_location",
                                        method: 'GET',
                                           headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                            },params
                                     
                                  }),
                                 pollingInterval: 10000,
                               providesTags: ['get_live_location'],
        }),
           Onduty_uploaded_image:builder.query({
                              query: (params) => {
                                            return {
                                      url:onduty+`/Onduty_uploaded_image?image=${params?.name}`,
                                         method: 'GET',
                                         headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                      }
                                         
                                      }
                                   },
                               providesTags: ['Onduty_uploaded_image'],
                           }),get__Vechile:builder.query({
                              query: ({params}) => {
                                            return {
                                      url:onduty+`/get__Vechile`,
                                         method: 'GET',
                                         headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                      },
                                         params
                                         
                                      }
                                   },
                                providesTags: ['get__Vechile'],
                             }),get__Date_Wise_Fuel:builder.query({
                              query: ({params}) => {
                                            return {
                                         url:onduty+`/get__Date_Wise_Fuel`,
                                         method: 'GET',
                                         headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                      },
                                         params
                                         
                                      }
                                   },
                                providesTags: ['get__Date_Wise_Fuel'],
                             }),
                             get__Date_Wise_Fuel_Individual:builder.query({
                              query: ({params}) => {
                                            return {
                                         url:onduty+`/get__Date_Wise_Fuel_Individual`,
                                         method: 'GET',
                                         headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                      },
                                         params
                                         
                                      }
                                   },
                                providesTags: ['get__Date_Wise_Fuel_Individual'],
                             }),
                             get_live_user:builder.query({
                              query: (params) => ({
                                           
                                          url:onduty+"/get_live_user",
                                        method: 'GET',
                                           headers: {
                                         'Content-type': 'application/json; charset=UTF-8',
                                            },params
                                     
                                  }),
                                  pollingInterval: 5000,
                                providesTags: ['get_live_user'],
        }),
        get_reached:builder.query({
                              query: (params) => {
                                            return {
                                         url:onduty+`/get_reached`,
                                        method: 'GET',
                                        headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                     },
                                        params
                                        
                                     }
                                  },
                               providesTags: ['get_reached'],
                             })
                        

    }),
})

export const {
useOndutyRequestMutation,useGetDocIDQuery,useGetInQuery,useRequestOndutyOutMutation,useRequestOnduty_ApprovalMutation,useGet__Date_Wise_Fuel_IndividualQuery,useGetHod_showable_dataQuery,useAddOnduty_masterMutation,useGet_all_Onduty_reasonQuery,useOnduty_uploaded_imageQuery,useGet__VechileQuery,useGet__Date_Wise_FuelQuery,useGet__Onduty_editQuery,
useGet_history_locationQuery,useGet_live_locationQuery,useGet_live_userQuery,useGet__vechilekmQuery,useAdd__vechilekmMutation,useStTrackMutation,useGet_reachedQuery,useRequestReachedOutMutation
} = OndutyRTk;

export default OndutyRTk
