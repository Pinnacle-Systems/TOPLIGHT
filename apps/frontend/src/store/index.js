import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import { UsersApi } from "./api/userApi";
import { DashboardApi } from "./api/dashboardApi";
import { NotificationApi } from './api/notificationApi';
import OndutyRTk from './api/OndutyApi';
import LeaveData from './api/LeaveApi';
import { RoleOnApi } from './api/RoleOnApi';
import { commonMastersApi } from './api/commonMastersApi';
import { permissionApi } from './api/permissionApi';
import AttendanceApi from './api/attendanceApi';
import userDetailsReducer from "./slices/userDetailsSlice";
import dueDaysReducer from "./slices/dueDaysSlice";
import ondutyInputReducer from "./slices/ondutyInputSlice";

export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer,
    [DashboardApi.reducerPath]: DashboardApi.reducer,
    [NotificationApi.reducerPath]: NotificationApi.reducer,
    [OndutyRTk.reducerPath]: OndutyRTk.reducer,
    [LeaveData.reducerPath]: LeaveData.reducer,
    [RoleOnApi.reducerPath]: RoleOnApi.reducer,
    [commonMastersApi.reducerPath]: commonMastersApi.reducer,
    [permissionApi.reducerPath]: permissionApi.reducer,
    [AttendanceApi.reducerPath]: AttendanceApi.reducer,
    UserDetails: userDetailsReducer,
    dueDays: dueDaysReducer,
    ondutyInput: ondutyInputReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      UsersApi.middleware,
      DashboardApi.middleware,
      NotificationApi.middleware,
      OndutyRTk.middleware,
      LeaveData.middleware,
      RoleOnApi.middleware,
      commonMastersApi.middleware,
      permissionApi.middleware,
      AttendanceApi.middleware,
    ]),
});

setupListeners(store.dispatch);
