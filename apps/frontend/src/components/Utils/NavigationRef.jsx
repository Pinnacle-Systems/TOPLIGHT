import { createNavigationContainerRef } from "@react-navigation/native";

export const NavRef=createNavigationContainerRef()
export function CustomNavigation(name,params){
    
    NavRef.navigate(name,params)
}