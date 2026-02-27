import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "./authService";

/* ================================
   TYPES
================================ */

export interface IUser {
  id: string;
  pj: string;
  role: string;
}

interface AuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  pj: string;
  password: string;
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

    // Expected backend response:
    // {
    //   token: "jwt-token",
    //   data: { id, pj, role }
    // }

    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed"
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
        state.error = action.payload || "Something went wrong";
      });
  },
});

/* ================================
   EXPORTS
================================ */

export const { logout } = authSlice.actions;
export default authSlice.reducer;
