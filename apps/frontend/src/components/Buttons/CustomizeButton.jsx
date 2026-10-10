import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import CustomText from "../Text/CustomText";


function CustomizeButton({children,bg,style,...props}) {

    const ButtonStyle=StyleSheet.create({
      ButtonOuter:{
        borderWidth:0,
        backgroundColor: bg || "black",
        padding:10,
        borderRadius:10,
        width:200,
       alignItems:"center",
       shadowColor: '#c9c6c5',
       shadowOpacity: 0.2,
       shadowRadius: 3,
       zIndex:100
      },
      ButtonText:{
       color:"white"
      }
    })
  return (
    <TouchableOpacity style={[ButtonStyle.ButtonOuter,style?.ButtonOuter]}  {...props}>
        {typeof children === 'string' ? (
            <CustomText style={[ButtonStyle.ButtonText,style?.ButtonText]} {...props}>
                {children}
            </CustomText>
        ) : (
            children
        )}
    </TouchableOpacity>
  )
}

export default CustomizeButton