import React, { useState } from 'react'
import { UserProfileCard } from './UserProfile'
import { StyleSheet, Text, View } from 'react-native'
import CustomText from '../../components/Text/CustomText'
import { Feather } from 'react-native-vector-icons'
import LogoutButton from '../../ReusableComponents/LogOutButton'
import CameraModal from '../../components/Modal/CameraModal'
import { useGetLastMonthSalaryQuery } from '../../store/api/dashboardApi'
import { NumbertoCurrency } from '../../components/Utils/NumberToCurrency'
import { useAppTheme } from '../../theme'

const createSalaryStyles = theme => StyleSheet.create({
    SalaryContainer:{
     display:"flex",
     flexDirection:"row"
     ,backgroundColor:theme.colors.surface,
     borderWidth:1,
     borderColor:theme.colors.borderSubtle,
     borderRadius:4,
     paddingRight:10,
     width:"99%",
     justifyContent:"center"
    },salaryBox:{
        padding:10,
        flexDirection:"column",
        justifyContent:"space-around"
    },salaryValue:{
        marginTop:10,
        textAlign:"center",
        color:theme.colors.text
    },salaryTitle:{
        fontWeight:"bold",
        fontSize:11.9,
        color:theme.colors.textSecondary,
      
    }
})
function CustomizeProfile_Higher_Pos({UserId}) {
    const { theme } = useAppTheme()
    const SalaryBoard = React.useMemo(() => createSalaryStyles(theme), [theme])

    const [isCameraModal,setisCameraModel]=useState(false)
    const [profilepicture,setprofilepicture]=useState("")
    const {data:LastMonthSalary}=useGetLastMonthSalaryQuery({Idcard:UserId?.UserId})
    const LastMonthSalaryAmount=NumbertoCurrency(LastMonthSalary?.data?.salary || 0)
  return (
    <>
    <View style={{flexDirection:"row",justifyContent:"space-around",marginTop:20}}><CustomText style={{fontWeight:"bold",fontSize:20,color:theme.colors.text}} >My Profile </CustomText><Feather name="edit" style={{marginLeft:10}} size={24} color={theme.colors.text} /></View>
   <CameraModal visible={isCameraModal} Idcard={UserId?.UserId} setVisible={setisCameraModel} onPictureTaken={setprofilepicture}></CameraModal>
    <UserProfileCard USER={UserId} picture={profilepicture} openCamera={setisCameraModel} ></UserProfileCard>
    <View style={SalaryBoard?.SalaryContainer}>
        <View style={SalaryBoard?.salaryBox}><CustomText style={SalaryBoard?.salaryTitle}>LastMonth Salary</CustomText> <CustomText style={SalaryBoard?.salaryValue}>{LastMonthSalaryAmount}</CustomText> </View>
        <View style={SalaryBoard?.salaryBox}><View style={{width:2,height:23,borderLeftWidth:.2,borderColor:theme.colors.divider,position:"absolute",left:0,marginTop:"25%"}}><Text></Text></View><CustomText style={[SalaryBoard?.salaryTitle,{color:theme.colors.text}]}>Today Allowance</CustomText><CustomText style={[SalaryBoard?.salaryValue,{color:theme.colors.text}]}>3000</CustomText></View>
        <View style={SalaryBoard?.salaryBox}><View style={{width:2,height:23,borderLeftWidth:.2,borderColor:theme.colors.divider,position:"absolute",left:0,marginTop:"25%"}}><Text></Text></View> <CustomText style={[SalaryBoard?.salaryTitle,{color:theme.colors.text}]}>Total Leave Avail</CustomText><CustomText style={[SalaryBoard?.salaryValue,{color:theme.colors.text}]}>3Days</CustomText></View>
         
    </View>
    
    </>
  )
}

export default CustomizeProfile_Higher_Pos
