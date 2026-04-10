import { configureStore } from "@reduxjs/toolkit";
import openTabs from "./features/opentabs";
import dueDaysReducer from './Slices/dueDaysSlice';
import tableData from "./Slices/insuranceDataSlice";
import { poRegister, commonMast, supplier, poData, misDashboardService, ordManagement, UsersApi } from './service';
import { setupListeners } from '@reduxjs/toolkit/query';
import UserDetails from "./Slices/UserDetails";
import inpuHandler from "./Slices/inputsHandler";
import PermissionEntry from "./service/permission";
import NotificationRTk from "./service/Notification";
import LeaveData from "./service/Leave";
import AdvanceData from "./service/Advance";
import { createLogger } from 'redux-logger';
import RoleOnSevices from "./service/RoleOn";
import OndutyRTk from "./service/Onduty";
import AttendanceRTk from "./service/AttendanceRtk";

// Define logger BEFORE using it in configureStore
const logger = createLogger({
  collapsed: (getState, action, logEntry) => !logEntry.error,
  predicate: () => __DEV__, // Only log in development
  duration: true,
  timestamp: true,
  colors: {
    title: () => '#0f0',
    prevState: () => '#9E9E9E',
    action: () => '#03A9F4',
    nextState: () => '#4CAF50',
    error: () => '#F20404',
  }
});


export const store = configureStore({
  reducer: {
    openTabs,
    [poRegister.reducerPath]: poRegister.reducer,
    [commonMast.reducerPath]: commonMast.reducer,
    [supplier.reducerPath]: supplier.reducer,
    [poData.reducerPath]: poData.reducer,
    [misDashboardService.reducerPath]: misDashboardService.reducer,
    [ordManagement.reducerPath]: ordManagement.reducer,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [PermissionEntry.reducerPath]: PermissionEntry.reducer,
    [NotificationRTk.reducerPath]: NotificationRTk.reducer,
    [LeaveData.reducerPath]: LeaveData.reducer,
    [AdvanceData.reducerPath]: AdvanceData.reducer,
    [RoleOnSevices.reducerPath]:RoleOnSevices.reducer,
    [OndutyRTk.reducerPath]:OndutyRTk.reducer,
  [AttendanceRTk.reducerPath]:AttendanceRTk.reducer,
    dueDays: dueDaysReducer,
    tableData: tableData,
    UserDetails: UserDetails,
    Input: inpuHandler
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat([
        poRegister.middleware,
        commonMast.middleware,
        supplier.middleware,
        poData.middleware,
        misDashboardService.middleware,
        ordManagement.middleware,
        UsersApi.middleware,
        PermissionEntry.middleware,
        NotificationRTk.middleware,
        LeaveData.middleware,
        AdvanceData?.middleware,
        RoleOnSevices.middleware,
        OndutyRTk.middleware,
        AttendanceRTk.middleware,
        ...(__DEV__ ? [logger] : []) // Only add logger in development
      ]),
      
});

setupListeners(store.dispatch);