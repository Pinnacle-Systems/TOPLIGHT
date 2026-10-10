import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export async function SetHeader(headers) {
    
  try {
    const result = await AsyncStorage.getItem("userName");

    if (result) {
      
      const GetuserDetails = JSON.parse(result);
    
      headers.set('compcode', `${GetuserDetails?.GCOMPCODE}`);
      headers.set('username', `${GetuserDetails?.userName}`);
      headers.set('Idcard', `${GetuserDetails?.Id}`);
    }
  } catch (error) {
    console.error("Error reading user details from AsyncStorage:", error);
  }
  return headers;
}
