package com.LIGHT

data class InsurancePolicy(
    val sno: Int,
    val docId: String,
    val docDate: String,
    val discoFinAsset: String, // "FOUR WHEELER" or "TWO WHEELER"
    val ownership: String,
    val vehNo: String,        // Vehicle number
    val vehName: String,      // Vehicle name
    val insuredby: String,    // Insurance company
    val policyNo: String,
    val validFrom: String,
    val validTo: String,
    val dueDays: Int,
    val insPremiumValue: Int,
    val totalPremium: Int,
    val paymentDetails: String,
    val paymentMode: String,
    val usedby: String       // Person using the vehicle
)