// InsuranceAdapter.kt
package com.LIGHT

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import InsuranceItem

class InsuranceAdapter(
    context: Context,
    private val items: List<InsuranceItem>
) : ArrayAdapter<InsuranceItem>(context, R.layout.insurance_item, items) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context)
            .inflate(R.layout.insurance_item, parent, false)

        val item = getItem(position)
        
        view.findViewById<TextView>(R.id.carModelText).text = item?.carModel
        view.findViewById<TextView>(R.id.insuranceTypeText).text = item?.insuranceType
        view.findViewById<TextView>(R.id.insuranceDateText).text = "Expires: ${item?.expiryDate}"
        // view.findViewById<TextView>(R.id.insuranceCompanyText).text = item?.insuranceCompany

        return view
    }
}