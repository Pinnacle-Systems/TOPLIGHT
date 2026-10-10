import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
import { UsersApi } from "./api/userApi";
import { DashboardApi } from "./api/dashboardApi";
import { NotificationApi } from './api/notificationApi';
import OndutyRTk from './api/OndutyApi';
import LeaveData from './api/LeaveApi';
import userDetailsReducer from "./slices/userDetailsSlice";
import dueDaysReducer from "./slices/dueDaysSlice";

export const store = configureStore({
  reducer: {
    [UsersApi.reducerPath]: UsersApi.reducer,
    [DashboardApi.reducerPath]: DashboardApi.reducer,
    [NotificationApi.reducerPath]: NotificationApi.reducer,
    [OndutyRTk.reducerPath]: OndutyRTk.reducer,
    [LeaveData.reducerPath]: LeaveData.reducer,
    UserDetails: userDetailsReducer,
    dueDays: dueDaysReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      UsersApi.middleware,
      DashboardApi.middleware,
      NotificationApi.middleware,
      OndutyRTk.middleware,
      LeaveData.middleware,
    ]),
});

setupListeners(store.dispatch);




