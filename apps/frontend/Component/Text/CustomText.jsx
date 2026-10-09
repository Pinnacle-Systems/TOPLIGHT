
import { Text } from "react-native"

import React from "react"


function CustomText({style,children,...props}) {

  
  return (
   <Text style={[style,{fontFamily:"Nunito-Regular"}]} {...props}>{children}</Text>
  )
}

export default CustomText