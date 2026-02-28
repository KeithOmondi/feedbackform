import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { loginUser } from "./authService";

/* ================================
    TYPES
================================ */

export interface IUser {
  _id: string; // Mongoose uses _id
  pj: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user"; // Crucial for routing
  station?: string;
  img?: string;
}

interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  pj: string;
}

interface LoginResponse {
  token: string;
  data: IUser; // The user object returned from backend
}

/* ================================
    INITIAL STATE (Safe Hydration)
================================ */

const getInitialUser = (): IUser | null => {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

/* ================================
    LOGIN THUNK
================================ */

export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (data, thunkAPI) => {
  try {
    const response = await loginUser(data);
    return response; // response contains { token, data }
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Invalid PJ Number or Access Denied"
    );
  }
});

/* ================================
    SLICE
================================ */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        const { token, data } = action.payload;
        state.loading = false;
        state.user = data;
        state.token = token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Authentication failed";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;