// InsuranceRemoteViewsFactory.kt in com.LIGHT package
package com.LIGHT

import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import kotlinx.coroutines.runBlocking
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import com.LIGHT.InsurancePolicy
import com.LIGHT.InsuranceApiService

class InsuranceRemoteViewsFactory(
    private val context: Context,
    private val intent: Intent
) : RemoteViewsService.RemoteViewsFactory {

    private val policies = mutableListOf<InsurancePolicy>()
    private lateinit var apiService: InsuranceApiService

    override fun onCreate() {
        val retrofit = Retrofit.Builder()
            .baseUrl("https://agfmobile.pinnaclesystems.co.in/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            
        
        apiService = retrofit.create(InsuranceApiService::class.java)
    }

    override fun onDataSetChanged() {
        runBlocking {
            try {
                val response = apiService.getInsurancePolicies()
                policies.clear()
                if (response.statusCode == 0) {
                    policies.addAll(response.data)
                } else {
                    policies.addAll(getSampleData())
                }
            } catch (e: Exception) {
                e.printStackTrace()
                policies.clear()
                policies.addAll(getSampleData())
            }
        }
    }

    private fun getSampleData(): List<InsurancePolicy> {
        return listOf(
            InsurancePolicy(
                sno = 1,
                docId = "SAMPLE-001",
                docDate = "",
                discoFinAsset = "FOUR WHEELER",
                ownership = "COMPANY",
                vehNo = "TN 00 AA 0000",
                vehName = "SAMPLE VEHICLE",
                insuredby = "SAMPLE INSURANCE",
                policyNo = "SAMPLE123",
                validFrom = "",
                validTo = "",
                dueDays = 30,
                insPremiumValue = 10000,
                totalPremium = 12000,
                paymentDetails = "Yes",
                paymentMode = "By Cheque",
                usedby = "TEST USER"
            )
        )
    }

    override fun getViewAt(position: Int): RemoteViews {
        val policy = policies[position]
        val views = RemoteViews(context.packageName, R.layout.insurance_item)
        
        views.setTextViewText(R.id.carModelText, "${policy.vehName} (${policy.vehNo})")
        views.setTextViewText(R.id.insuranceTypeText, policy.discoFinAsset)
        views.setTextViewText(R.id.insuranceDateText, 
            "Valid to ${policy.validTo.take(10)} dueDays: ${policy.dueDays}")
        // views.setTextViewText(R.id.insuranceCompanyText, 
        //     "${policy.insuredby} (${policy.policyNo})")
        
        val iconRes = when (policy.discoFinAsset) {
            "FOUR WHEELER" -> R.drawable.ic_car
            "TWO WHEELER" -> R.drawable.ic_bike
            else -> R.drawable.ic_vehicle
        }
        views.setImageViewResource(R.id.vehicleIcon, iconRes)
        
        val fillInIntent = Intent().apply {
            putExtra("POLICY_ID", policy.docId)
            putExtra("POSITION", position)
        }
        views.setOnClickFillInIntent(R.id.widget_item_container, fillInIntent)
        
        return views
    }

    override fun getCount() = policies.size
    override fun getViewTypeCount() = 1
    override fun getItemId(position: Int) = position.toLong()
    override fun hasStableIds() = true
    override fun onDestroy() {}
    override fun getLoadingView() = null
}