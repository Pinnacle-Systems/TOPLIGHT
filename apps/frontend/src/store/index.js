import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import { UsersApi } from "./api/UserApi";
import { DashboardApi } from "./api/DashboardApi";
import { NotificationApi } from './api/NotificationApi';
import OndutyRTk from './api/OndutyApi';
import LeaveData from './api/LeaveApi';
import { RoleOnApi } from './api/RoleOnApi';
import { commonMastersApi } from './api/CommonMastersApi';
import { permissionApi } from './api/PermissionApi';
import AttendanceApi from './api/AttendanceApi';
import userDetailsReducer from "./slices/UserDetailsSlice";
import dueDaysReducer from "./slices/DueDaysSlice";
import ondutyInputReducer from "./slices/OndutyInputSlice";

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
