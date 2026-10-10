import React from 'react';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const SiderBarTabs = [
    { name: "Home", icon: <MaterialIcons name="home" size={24} color="#64748B" />, path: "HOME" },
    { name: "User Control", icon: <MaterialIcons name="manage-accounts" size={24} color="#64748B" />, path: "USERANDROLES" },
    { name: "DashBoard", icon: <MaterialIcons name="dashboard" size={24} color="#64748B" />, path: "DashBoard" },
    { name: "Change Password", icon: <MaterialIcons name="password" size={24} color="#64748B" />, path: "change_Password" },
    { name: "Reports", icon: <MaterialCommunityIcons name="chart-bar-stacked" size={24} color="#64748B" />, path: "report" },
    { name: "User Info", icon: <MaterialCommunityIcons name="information" size={24} color="#64748B" />, path: "uinfo" },
    { name: "User Logs", icon: <MaterialIcons name="perm-device-info" size={24} color="#64748B" />, path: "logs" },
    { name: "Chats", icon: <MaterialIcons name="chat" size={24} color="#64748B" />, path: "chats" },
    { name: "Settings", icon: <MaterialIcons name="settings" size={24} color="#64748B" />, path: "settings" }
];

export default SiderBarTabs;
