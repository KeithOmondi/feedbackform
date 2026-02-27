import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "./authService";

/* ================================
    TYPES
================================ */

export interface IUser {
  id: string;
  pj: string;
  role: "admin" | "user"; // Explicitly typed for better routing logic
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Password removed from payload
interface LoginPayload {
  pj: string;
}

interface LoginResponse {
  token: string;
  data: IUser;
}

/* ================================
    INITIAL STATE (Persisted)
================================ */

const tokenFromStorage = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user");

const initialState: AuthState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage,
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
    return response;
  } catch (error: any) {
    // Handling cases where the backend might return 404 for a missing PJ
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Authentication failed"
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
      /* ===== LOGIN PENDING ===== */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /* ===== LOGIN SUCCESS ===== */
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.token = action.payload.token;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.data)
        );
      })

      /* ===== LOGIN FAILED ===== */
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unauthorized PJ Number";
      });
  },
});

/* ================================
    EXPORTS
================================ */

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;