import React from 'react'
import CustomInput from '../Inputs/CustomInput'
import { StyleSheet, Text,View } from 'react-native'
import CustomText from '../Text/CustomText'
import { FontAwesome5 } from 'react-native-vector-icons'
import CustomizeButton from '../Buttons/CustomizeButton'
import { screenWidth } from '../Utils/Screens'
import InputWraper from './InputWraper'
import { Master_Meta } from '../../redux/States/Master/Master'
import { useSelector } from 'react-redux'

function Transaction() {
const InputState=useSelector((state)=>state?.Input?.Master_state)

  
  return (<View style={{flex:1,marginTop:5}}>
     <CustomText style={{fontWight:"bold",fontSize:17,color:"#6f7275",marginLeft:10,textAlign:"center"}}><FontAwesome5 name="building" size={26} color="black" /> Company Master</CustomText>
     <InputWraper states={Master_Meta}></InputWraper>
       <View style={{position:"absolute",bottom:0,right:0,left:0,width:screenWidth+40}}>
   <CustomizeButton onPress={()=>alert(JSON?.stringify(InputState))} style={{ButtonOuter:{width:screenWidth,backgroundColor:"#0273e3",borderColor:"#0273e3",borderRadius:0}}}>Save</CustomizeButton>
   </View>
   </View>
  )
}

export default Transaction