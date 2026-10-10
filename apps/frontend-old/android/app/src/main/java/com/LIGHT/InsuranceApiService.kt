// InsuranceApiService.kt in com.LIGHT.network package
package com.LIGHT

import com.LIGHT.ApiResponse
import retrofit2.http.GET
import retrofit2.http.Headers

interface InsuranceApiService {

    @Headers("COMPCODE: SPK")
    @GET("misDashboard/getInsuranceDataAlert")
    suspend fun getInsurancePolicies(): ApiResponse
}