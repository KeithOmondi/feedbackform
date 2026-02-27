import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import manualReducer from "../features/manual/manualSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    manual: manualReducer,
  },
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
