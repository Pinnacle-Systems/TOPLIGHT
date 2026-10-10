import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
const SiderBarTabs=[{name:"Home",icon: <MaterialIcons name="home" size={24}  />,path:"HOME"},
    {name:"User Control",icon: <MaterialIcons name="manage-accounts" size={24}  />,path:"USERANDROLES"},
    {name:"DashBoard",icon: <MaterialIcons name="dashboard" size={24} color="black" />,path:"DashBoard"},
    {name:"Change Password",icon: <MaterialIcons name="password" size={24} color="black" />,path:"change_Password"},
    {name:"Reports",icon: <MaterialCommunityIcons name="chart-bar-stacked" size={24} color="black" />,path:"report"},
    {name:"User Info",icon: <MaterialCommunityIcons name="information" size={24} color="black" />,path:"uinfo"},
     {name:"User Logs",icon: <MaterialIcons name="perm-device-info" size={24} color="black" />,path:"logs"},
     {name:"Chats",icon: <MaterialIcons name="chat" size={24} color="black" />,path:"chats"},
     {name:"Settings",icon: <MaterialIcons name="settings" size={24} color="black" />,path:"settings"}
]

export default SiderBarTabs