import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRef, useState } from "react"


export  const useCheckUserAuth=()=>{
        var [verified,setVerified]=useState(false)
        AsyncStorage.getItem("userName",(error,result)=>{
            if(!error){
                if(result){
                 setVerified(tree)
                }
            }
        })
        return verified
    }