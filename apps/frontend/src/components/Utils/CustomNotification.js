import { showMessage } from "react-native-flash-message";

const Custom_Notification=(data,{message,title})=>{
    switch (data) {
        case 1:
            showMessage({
                message: "Store",
                description: "Data Added SuccessFully",
                type:"success",
              })  
            break;

            case 0:
                showMessage({
                    message: "Store",
                    description: "Data Added Failed !",
                    type:"danger",
                  })  
                break;
        
    
        default:
            showMessage({
                message: title,
                description: message,
                type:"danger",
              })
            break;
    }
      
    }

    export default Custom_Notification