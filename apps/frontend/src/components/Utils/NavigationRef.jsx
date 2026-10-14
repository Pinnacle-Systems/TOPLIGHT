import { createNavigationContainerRef } from "@react-navigation/native";

export const NavRef=createNavigationContainerRef()
export function CustomNavigation(name,params){
    if (!NavRef.isReady()) return false;
    NavRef.navigate(name,params);
    return true;
}