import React, { useEffect, useLayoutEffect, useState } from 'react'
import { View ,Text, StyleSheet, ScrollView} from 'react-native'
import CustomDropdownSelect from '../../../DropDownSelect/DropDownSelect'
import { EsiandPFBodyStyle } from '../Style/EsiPfStyle'
import CustomText from '../../../Text/CustomText'
import { Button } from 'react-native-paper'
import { screenWidth } from '../../../Utils/Screens'


function OTESIPFFilter({year,setyear,Month,setMonth,CurrentYearandMonth,setepYear,setepMonth,closeModel}) {
const closeFilterwithFilter=()=>{
    setepYear(year)
    setepMonth(Month)
    closeModel(false)
}
useEffect(() => {
setyear(Number(CurrentYearandMonth?.split(" ")[1]))
setMonth(CurrentYearandMonth?.split(" ")[0])
}, [])



  return (
    <View style={{height:"100%"}}>  
       
     
<View style={[EsiandPFBodyStyle?.EsipfContainer]}>
    <View style={{flexDirection:"row",width:"100%",gap:10,padding:1}}>
<CustomDropdownSelect   placeholder={"select Year"} isyear={true} width={screenWidth/2.9} selectedValue={year} setSelectedValue={setyear} ></CustomDropdownSelect>
<CustomDropdownSelect placeholder={"select Month"} ismonth={true} width={screenWidth/2.9} selectedValue={Month} setSelectedValue={setMonth} ></CustomDropdownSelect>

</View>
<CustomText style={EsiandPFBodyStyle?.Datetext}>OT & ESI & PF On : {year && Month && Month+" "+year } </CustomText>
<Button style={{backgroundColor:"green",margin:10}} textColor='white'onPress={closeFilterwithFilter}>Filter</Button>
</View>




     </View>
  )
}




export default OTESIPFFilter