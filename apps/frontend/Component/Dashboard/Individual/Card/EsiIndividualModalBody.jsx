import React, { useLayoutEffect, useState } from 'react'
import { View ,Text, StyleSheet} from 'react-native'
import CustomDropdownSelect from '../../../DropDownSelect/DropDownSelect'
import { EsiandPFBodyStyle } from '../Style/EsiPfStyle'
import CustomText from '../../../Text/CustomText'
import { useGetESIQuery } from '../../../../redux/service/misDashboardService'
import { YearMonthRadio } from '../Widget/YearMonthRadio'


function EsiIndividualModalBody({CurrentESIAmt,CurrentYearandMonth,UserId}) {
   
    const [esiyear,setesiyear]=useState()
    const [esiMonth,setesiMonth]=useState()
    const [mory,setmory]=useState("M")
  


      useLayoutEffect(() => {
        const year=CurrentYearandMonth?.split(" ")[1]
        const Month=CurrentYearandMonth?.split(" ")[0]
    
        setesiyear(Number(year))
        setesiMonth(Month)
       
      }, [])

    const {data:esidata,error:err}=useGetESIQuery({params:{
      Idcard:UserId,payperiod:esiMonth  &&  esiyear ? esiMonth+" "+esiyear : CurrentYearandMonth,type:mory
    }}) 

   
    const esidataOnMonth= mory=="Y" ?  esidata?.data?.reduce(function (acc, obj) { return {esi:acc.esi + obj.esi} }, {esi:0}) : esidata?.data ? esidata?.data[0] : {} 


   
    

  return (
    <View>  
   <YearMonthRadio value={mory} setValue={setmory}></YearMonthRadio>
 <View style={{flexDirection:"row",width:"100%",gap:10}}>
      
       <CustomDropdownSelect placeholder={"select Year"} isyear={true} selectedValue={esiyear} setSelectedValue={setesiyear} ></CustomDropdownSelect>
    {mory=="M" && <CustomDropdownSelect placeholder={"select Year"} ismonth={true} selectedValue={esiMonth} setSelectedValue={setesiMonth} ></CustomDropdownSelect> }
    
     </View>
<View style={EsiandPFBodyStyle?.EsipfContainer}>
<CustomText style={EsiandPFBodyStyle?.Datetext}>ESI  On : {mory=="Y" ? esiyear && esiMonth :  esiyear ? esiMonth+" "+esiyear : CurrentYearandMonth}</CustomText>

<CustomText style={[EsiandPFBodyStyle?.amt,{fontSize:18,alignSelf:"center"}]}> {esidataOnMonth?.esi || CurrentESIAmt}</CustomText>

</View>

     </View>
  )
}

export default EsiIndividualModalBody