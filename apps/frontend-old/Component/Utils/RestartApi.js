import { Alert } from "react-native";

export function RestartApi(apis,dispatch){
    try {
      apis?.forEach(element => {
        dispatch(element?.util.resetApiState())  
       });

      } catch (error) {
        Alert.alert("ERROR",JSON?.stringify(error))
    }
}