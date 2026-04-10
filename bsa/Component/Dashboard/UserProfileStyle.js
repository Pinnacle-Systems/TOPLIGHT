import { StyleSheet } from "react-native";

export const UserProfile=StyleSheet.create({
    UserDetailContainer:{
      padding:0,
      position:"relative",
      borderBottomLeftRadius:-20,
      borderBottomRightRadius:-20,
      marginBottom:"3%",
      flexDirection:"column-reverse",
      backgroundColor:"#E5E7E7"
      
    },ImageContainer:{
     padding:1,
      display:"flex",
      justifyContent:"center",
      backgroundColor:"#E5E7E7",
      borderRadius:40,
      width:"100%",
      marginTop:10
      

    
    },BlurView:{
      elevation:90,
      shadowColor:"white",
      width:"100%",
      padding:1,
      paddingTop:20,
      paddingBottom:30,
      borderRadius:5,
      borderTopRightRadius:5,
      borderTopLeftRadius:5,

      
      
    },BlurViewText:{
      marginLeft:"7%",
      marginBottom:3,
      textTransform:"capitalize",
      color:"white"
      

      
    }
  })
