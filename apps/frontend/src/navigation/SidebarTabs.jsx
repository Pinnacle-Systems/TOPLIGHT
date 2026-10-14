import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const SiderBarTabs = [
    { name: "Home", icon: <MaterialIcons name="home" size={24} color="#64748B" />, path: "HOME" },
    { name: "On Duty", icon: <MaterialCommunityIcons name="clock-outline" size={24} color="#64748B" />, path: "onduty" },
    { name: "Leave Entry", icon: <MaterialCommunityIcons name="calendar-account-outline" size={24} color="#64748B" />, path: "lentry" },
    { name: "Permission Entry", icon: <MaterialCommunityIcons name="account-clock-outline" size={24} color="#64748B" />, path: "pentry" },
    { name: "User Control", icon: <MaterialIcons name="manage-accounts" size={24} color="#64748B" />, path: "USERANDROLES" },
    { name: "DashBoard", icon: <MaterialIcons name="dashboard" size={24} color="#64748B" />, path: "DashBoard" },
    { name: "Location Tracking", icon: <MaterialCommunityIcons name="map-marker-path" size={24} color="#64748B" />, path: "map" },
  //  { name: "Change Password", icon: <MaterialIcons name="password" size={24} color="#64748B" />, path: "change_Password" },
 //   { name: "Reports", icon: <MaterialCommunityIcons name="chart-bar-stacked" size={24} color="#64748B" />, path: "report" },
    { name: "User Info", icon: <MaterialCommunityIcons name="information" size={24} color="#64748B" />, path: "uinfo" },
    { name: "User Logs", icon: <MaterialIcons name="perm-device-info" size={24} color="#64748B" />, path: "logs" },
    { name: "Masters", icon: <MaterialCommunityIcons name="database-cog-outline" size={24} color="#64748B" />, path: "masters" },
    { name: "Settings", icon: <MaterialIcons name="settings" size={24} color="#64748B" />, path: "settings" }
];

export default SiderBarTabs;
