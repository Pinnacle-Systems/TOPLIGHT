import React, { useState } from 'react'
import { UserProfileCard } from './UserProfile'
import { StyleSheet, Text, View } from 'react-native'
import CustomText from '../../components/Text/CustomText'
import { Feather } from 'react-native-vector-icons'
import LogoutButton from '../../ReusableComponents/LogOutButton'
import CameraModal from '../../components/Modal/CameraModal'
import { useGetLastMonthSalaryQuery } from '../../store/api/dashboardApi'
import { NumbertoCurrency } from '../../components/Utils/NumberToCurrency'


const SalaryBoard=StyleSheet.create({
    SalaryContainer:{
     display:"flex",
     flexDirection:"row"
     ,backgroundColor:"#c8cfe3",
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
        textAlign:"center"
    },salaryTitle:{
        fontWeight:"bold",
        fontSize:11.9,  
      
    }
})
function CustomizeProfile_Higher_Pos({UserId}) {

    const [isCameraModal,setisCameraModel]=useState(false)
    const [profilepicture,setprofilepicture]=useState("")
    const {data:LastMonthSalary}=useGetLastMonthSalaryQuery({Idcard:UserId?.UserId})
    const LastMonthSalaryAmount=NumbertoCurrency(LastMonthSalary?.data?.salary || 0)
  return (
    <>
    <View style={{flexDirection:"row",justifyContent:"space-around",marginTop:20}}><CustomText style={{fontWeight:"bold",fontSize:20}} >My Profile </CustomText><Feather name="edit" style={{marginLeft:10}} size={24} color="black" /></View>
   <CameraModal visible={isCameraModal} Idcard={UserId?.UserId} setVisible={setisCameraModel} onPictureTaken={setprofilepicture}></CameraModal>
    <UserProfileCard USER={UserId} picture={profilepicture} openCamera={setisCameraModel} ></UserProfileCard>
    <View style={SalaryBoard?.SalaryContainer}>
        <View style={SalaryBoard?.salaryBox}><CustomText style={SalaryBoard?.salaryTitle}>LastMonth Salary</CustomText> <CustomText style={SalaryBoard?.salaryValue}>{LastMonthSalaryAmount}</CustomText> </View>
        <View style={SalaryBoard?.salaryBox}><View style={{width:2,height:23,borderLeftWidth:.2,borderColor:"gray",position:"absolute",left:0,marginTop:"25%"}}><Text></Text></View><CustomText style={SalaryBoard?.salaryTitle}>Today Allowance</CustomText><CustomText style={SalaryBoard?.salaryValue}>3000</CustomText></View>
        <View style={SalaryBoard?.salaryBox}><View style={{width:2,height:23,borderLeftWidth:.2,borderColor:"gray",position:"absolute",left:0,marginTop:"25%"}}><Text></Text></View> <CustomText style={SalaryBoard?.salaryTitle}>Total Leave Avail</CustomText><CustomText style={SalaryBoard?.salaryValue}>3Days</CustomText></View>
         
    </View>
    
    </>
  )
}

export default CustomizeProfile_Higher_Pos

