
import Home from "./Home";
import InsuranceReport from "./insuranceReport";
import LoginScreen from "./Login";
import UserAndRoles from "./User&roles";
import AttendanceReport from "./dailyAttendanceReport";
import index from "./Dashboard/indexDashBoard";
import UserInfo from "./UserInfo";
import Transaction from "./Screens/Transaction";
import PageMaster from "./Screens/Masters/Page/PageMaster";
import PermissionEntry from "./Screens/PermissionEntry";
import Permission_ApprovalScreen from "./Screens/Permission_ApprovalScreen";
import { Leave_Report, Permission_Report } from "./Screens/Report";
import Permissions from "./Screens/Masters/permissions";
import LeaveEntry from "./Screens/LeaveEntry";
import Leave_ApprovalScreen from "./Screens/Leave_approvalScreen";
import PageMaster_leave from "./Screens/Report/Page/PageMaster_leave";
import Leave_AvailableScreen from "./Screens/Leave_Available";
import PassWordChange from "./Screens/Auth/PassWordChange";
import Splash from "./Splash";
import AdvanceEntry from "./Screens/AdvanceEntry";
import Loan_ApprovalScreen from "./Screens/Loan_approvalScreen";
import AdvanceReport from "./Screens/Report/Advance/Advance_report";
import RoleOnPAge_Master from "./Screens/Masters/RoleOnPage_Master";
import OndutyEntry from "./Screens/Onduty";
import TrackerMap from "./Screens/Location/View/TrackerMap";
import Onduty_ApprovalScreen from "./Screens/Onduty_Approval";
import OndutyReport from "./Screens/Report/Onduty/Onduty_Report";
import OndutyMaster from "./Screens/Masters/Onduty_Master";
import SettingsScreen from "./Screens/Settings";
import UserProfileScreen_Higher from "./Screens/Higher_Admin/Higher_admin";
import LoginLogsScreen from "./Screens/Auth/UserLogs/UserLogs";
import ChatScreen from "./Screens/Chat/Chat";
import FuelReport from "./Screens/Report/Fuel/Fuel_Report";
import LocateOurCompany from "./Screens/Masters/LocateOurCompany";
import AttendanceEntry from "./Screens/Attendance/AttendanceEntry";



const tabs = [
    { key: "LOGIN", name: "LOGIN", component: LoginScreen,list:false,list_name:"Role On Page",default:true},
    { key: 'USERANDROLES', name: "USERANDROLES", component: UserAndRoles,list:true,list_name:"Role On Page" },
    { key: 'INSURANCEREPORT', name: "INSURANCEREPORT", component: InsuranceReport ,list:true,list_name:"Insurance"},
    { key: "HOME", name: "HOME", component: Home,list:true,default:true,list_name:"Home Page" },
    { key: "ATTENDANCEREPORT", name: "ATTENDANCEREPORT", component: AttendanceReport ,list:true,default:false,list_name:"Attence report" },
    { key: "DashBoard", name: "DashBoard", component:index,list:true,default:true,list_name:"DashBoard"   },
    { key: "uinfo", name: "uinfo", component:UserInfo,list:true,default:false,list_name:"User Info"  },
    { key: "transaction", name: "transaction", component:Transaction,list:false,default:false,list_name:"TRANSACTION"  },
    { key: "pentry", name: "pentry", component:PermissionEntry,list:true,default:false,list_name:"Permission Entry" },
    { key: "p_approval", name: "p_approval", component: Permission_ApprovalScreen,list:true,default:false,list_name:"Pemission Approval" },
   {key: "report", name: "report", component: PageMaster_leave,list:true,default:false,list_name:"Report"},
    {key: "per_report", name: "per_report", component: Permission_Report,list:false,default:false,list_name:"Permission Report"},
    {key: "onduty_report", name: "onduty_report", component: OndutyReport,list:true,default:false,list_name:"Onduty report"},
    {key: "leave_report", name: "leave_report", component: Leave_Report,list:true,default:false,list_name:"leave Report"},
     {key: "advance_report", name: "advance_report", component: AdvanceReport,list:true,default:false,list_name:"Advance Report"},
    {key: "masters", name: "masters", component: PageMaster,list:true,default:false,list_name:"Master"},
    {key: "m_permission", name: "m_permission", component: Permissions,list:true,default:false,list_name:"Permission Master"},
    {key: "lentry", name: "lentry", component:LeaveEntry,list:true,default:false,list_name:"Leave Entry"},
    { key: "l_approval", name: "l_approval", component: Leave_ApprovalScreen,list:true,default:false,list_name:"Leave Approval"},
    { key: "ln_approval", name: "ln_approval", component: Loan_ApprovalScreen,list:true,default:false,list_name:"Loan Approval"},
     { key: "onduty_approval", name: "onduty_approval", component: Onduty_ApprovalScreen,list:true,default:false,list_name:"Onduty Approval"},
    { key: "l_available", name: "l_available", component: Leave_AvailableScreen,list:true,default:false,list_name:"Leave available"},
    { key: "change_Password", name: "change_Password", component: PassWordChange,list:true,default:false,list_name:"Allow Password Change"},
    { key:  "SPLASH",name: "SPLASH", component:Splash,list:false,default:true,list_name:"Splash" },
    { key: "aentry", name: "aentry", component: AdvanceEntry,list:true,default:false,list_name:"Adavce Entry"},
    { key: "page_master", name: "page_master", component: RoleOnPAge_Master,list:true,default:false,list_name:"Role Master"},
     { key: "onduty_master", name: "onduty_master", component: OndutyMaster,list:true,default:false,list_name:"Onduty Master"},
    { key: "onduty", name: "onduty", component: OndutyEntry,list:true,default:false,list_name:"On Duty"},
     { key: "map", name: "map", component: TrackerMap,list:true,default:false,list_name:"Maps"},
     { key: "settings", name: "settings", component: SettingsScreen,list:true,default:false,list_name:"Settings"},
     { key: "fuel", name: "fuel", component: FuelReport,list:true,default:false,list_name:"Fuel Report"},
     { key: "admin_higher", name: "admin_higher", component:UserProfileScreen_Higher,list:true,default:false,list_name:"higher Officer"},
    { key: "logs", name: "logs", component:LoginLogsScreen,list:true,default:false,list_name:"Login Logs"},
     { key: "home_locate_master", name: "home_locate_master", component:LocateOurCompany,list:true,default:false,list_name:"Locate Home"},
     { key: "chats", name: "chats", component:ChatScreen,list:true,default:false,list_name:"chat Screen"} ,
      { key: "Att", name: "Att", component:AttendanceEntry,list:true,default:false,list_name:"Attendance Entry"}   
];



export default tabs;
