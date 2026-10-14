import React, { useEffect } from 'react'
import { View } from 'react-native'
import CustomDropdownSelect from '../../../../components/DropDownSelect/DropDownSelect'
import { EsiandPFBodyStyle } from '../Style/EsiPfStyle'
import CustomText from '../../../../components/Text/CustomText'
import { Button } from 'react-native-paper'
import { screenWidth } from '../../../../components/Utils/Screens'
import { useAppTheme } from '../../../../theme'


function OTESIPFFilter({year,setyear,Month,setMonth,CurrentYearandMonth,setepYear,setepMonth,closeModel}) {
const { theme } = useAppTheme()
const closeFilterwithFilter=()=>{
    setepYear(year)
    setepMonth(Month)
    closeModel(false)
}
useEffect(() => {
setyear(Number(CurrentYearandMonth?.split(" ")[1]))
setMonth(CurrentYearandMonth?.split(" ")[0])
}, [CurrentYearandMonth, setMonth, setyear])



  return (
    <View style={{height:"100%",backgroundColor:theme.colors.surface}}>
       
     
<View style={[EsiandPFBodyStyle?.EsipfContainer]}>
    <View style={{flexDirection:"row",width:"100%",gap:10,padding:1}}>
<CustomDropdownSelect   placeholder={"select Year"} isyear={true} width={screenWidth/2.9} selectedValue={year} setSelectedValue={setyear} ></CustomDropdownSelect>
<CustomDropdownSelect placeholder={"select Month"} ismonth={true} width={screenWidth/2.9} selectedValue={Month} setSelectedValue={setMonth} ></CustomDropdownSelect>

</View>
<CustomText style={[EsiandPFBodyStyle?.Datetext,{color:theme.colors.text}]}>OT & ESI & PF On : {year && Month && Month+" "+year } </CustomText>
<Button style={{margin:10}} buttonColor={theme.colors.brand} textColor={theme.colors.brandContrast} onPress={closeFilterwithFilter}>Filter</Button>
</View>




     </View>
  )
}




export default OTESIPFFilter
