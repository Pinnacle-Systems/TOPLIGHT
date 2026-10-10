

import React, { useLayoutEffect, useState } from 'react'
import { View ,Text, StyleSheet} from 'react-native'
import CustomDropdownSelect from '../../../../components/DropDownSelect/DropDownSelect'
import { EsiandPFBodyStyle } from '../Style/EsiPfStyle'
import CustomText from '../../../../components/Text/CustomText'
import { useGetMonthESIPFQuery } from '../../../../store/api/dashboardApi'
import { NumbertoCurrency } from '../../../../components/Utils/NumberToCurrency'
import { YearMonthRadio } from '../Widget/YearMonthRadio'

function PfIndividualModalBody({CurrentPFAmt,CurrentYearandMonth,UserId}) {
    
    const [pfyear,setpfyear]=useState()
    const [pfMonth,setpfMonth]=useState()
    const [mory,setmory]=useState("M")
      
    
    
      useLayoutEffect(() => {
            const year=CurrentYearandMonth?.split(" ")[1]
            const Month=CurrentYearandMonth?.split(" ")[0]
        
            setpfyear(Number(year))
            setpfMonth(Month)
           
          }, [])
    
        const {data:esiPfdata,error:err}=useGetMonthESIPFQuery({params:{
          Idcard:UserId,payperiod:pfMonth  &&  pfyear ? pfMonth+" "+pfyear : CurrentYearandMonth,type:mory
        }}) 

        
    
       
        const esidataOnMonth=mory=="Y" ? esiPfdata?.data?.reduce(function (acc, obj) { return {pf:acc.pf + obj.pf} }, {pf:0}) : esiPfdata?.data ? esiPfdata?.data[0] : {} 
 
    
  return (
    <View>  
       <YearMonthRadio value={mory} setValue={setmory}></YearMonthRadio>

          <View style={{flexDirection:"row",width:"100%",gap:10}}>
        <CustomDropdownSelect placeholder={"select Year"} isyear={true} selectedValue={pfyear} setSelectedValue={setpfyear} ></CustomDropdownSelect>
     {mory=="M"&&  <CustomDropdownSelect placeholder={"select Month"} ismonth={true} selectedValue={pfMonth} setSelectedValue={setpfMonth} ></CustomDropdownSelect>}
     </View>
<View style={EsiandPFBodyStyle?.EsipfContainer}>
<CustomText style={EsiandPFBodyStyle?.Datetext}>PF  On : {mory=="Y" ? pfyear :  pfyear && pfMonth ? pfMonth+" "+pfyear : CurrentYearandMonth}</CustomText>

<CustomText style={[EsiandPFBodyStyle?.amt,{fontSize:18,alignSelf:"center"}]}> {NumbertoCurrency( esidataOnMonth?.pf || 0) ||   CurrentPFAmt}</CustomText>

</View>

     </View>
  )
}

export default PfIndividualModalBody

