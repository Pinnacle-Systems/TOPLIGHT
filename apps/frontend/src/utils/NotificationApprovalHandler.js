import { showMessage } from "react-native-flash-message";

 export const Notofication_Approval_handler = (data) => {
     
        showMessage({
          message: "🔔 New Notification",
          description: `📩 Your Request has Been ${data?.data?.status} `,
          type: data?.data?.approved ? "success" : "danger", // still controls the default color unless overridden
          backgroundColor:data?.data?.approved ? "#4CAF50" : "#fc0317" , // green background (overrides `type`)
          color: "#fff",               // white text
          icon: { icon: data?.data?.approved  ? "success":"danger", position: "left" }, // icon appearance
          style: {
            padding: 16,
            borderLeftWidth: 5,
            borderLeftColor: "#2e7d32",
            borderRadius: 8,
            marginTop: 10,
            marginHorizontal: 10,
            elevation: 5,
          },
          titleStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
          textStyle: {
            fontSize: 14,
          },
          duration: 5000,
        });
        
      };