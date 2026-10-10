import { Alert } from "react-native";


export const AllowedTabs_Filter=({tabs,allowedTabs,tabsPath_key,allowedTabspath_key,condtion})=>{

  var data=(tabs || []).filter((sdata) => 
      (  Array.isArray(allowedTabs)  ? allowedTabs : [])?.some((data) => !condtion ?  data?.[allowedTabspath_key] === sdata?.[tabsPath_key] : (data?.[allowedTabspath_key] === sdata?.[tabsPath_key] && data?.[condtion])  )
    );

return data
}