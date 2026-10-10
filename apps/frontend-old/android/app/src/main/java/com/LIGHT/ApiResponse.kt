package com.LIGHT
import com.LIGHT.InsurancePolicy
data class ApiResponse(
    val statusCode: Int,
    val data: List<InsurancePolicy>
)