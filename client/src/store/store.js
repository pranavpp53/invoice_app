import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import  storage from 'redux-persist/lib/storage'

import authReducer from "../auth/authSlice";
import { roleApi } from "../api/roleApiSlice.js";
import { userApi } from "../api/userApiSlice.js";
import { settingsApi } from "../api/settingsApiSlice.js";
import { customerApi } from "../api/customersApiSlice.js";
import { invoiceApi } from "../api/invoiceApiSlice.js";
import { ledgerApi } from "../api/ledgerApiSlice.js";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  [roleApi.reducerPath]: roleApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [settingsApi.reducerPath]: settingsApi.reducer,
  [customerApi.reducerPath]: customerApi.reducer,
  [invoiceApi.reducerPath]: invoiceApi.reducer,
  [ledgerApi.reducerPath]: ledgerApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(
      userApi.middleware,
      roleApi.middleware,
      settingsApi.middleware,
      customerApi.middleware,
      invoiceApi.middleware,
      ledgerApi.middleware,
    ),
});

export const persistor = persistStore(store)
setupListeners(store.dispatch);