import {
  createSlice,
  createAsyncThunk,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as service from "./manualService";
import { type IManual, type PostEntryPayload } from "./manualService";

interface ManualState {
  manuals: IManual[];
  loading: boolean;
  error: string | null;
}

const initialState: ManualState = {
  manuals: [],
  loading: false,
  error: null,
};

/* ===============================
    THUNKS
================================ */

export const fetchManuals = createAsyncThunk(
  "manual/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await service.getManuals();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Fetch failed");
    }
  }
);

export const postEntry = createAsyncThunk(
  "manual/postEntry",
  async (payload: PostEntryPayload, { rejectWithValue }) => {
    try {
      return await service.addManualEntry(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || `Failed to post ${payload.type}`);
    }
  }
);

export const editManual = createAsyncThunk(
  "manual/update",
  async ({ id, data }: { id: string; data: Partial<IManual> }, { rejectWithValue }) => {
    try {
      return await service.updateManual(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const removeManual = createAsyncThunk(
  "manual/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await service.deleteManual(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

/* ===============================
    SLICE
================================ */

const manualSlice = createSlice({
  name: "manual",
  initialState,
  reducers: {
    clearManualError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Logic
      .addCase(fetchManuals.fulfilled, (state, action: PayloadAction<IManual[]>) => {
        state.loading = false;
        state.manuals = action.payload;
      })
      // Delete Logic
      .addCase(removeManual.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.manuals = state.manuals.filter((m) => m._id !== action.payload);
      })
      // Unified "Update Item in List" Logic for both postEntry and editManual
      .addMatcher(
        isAnyOf(postEntry.fulfilled, editManual.fulfilled),
        (state, action: PayloadAction<IManual>) => {
          state.loading = false;
          state.error = null;
          const index = state.manuals.findIndex((m) => m._id === action.payload._id);
          if (index !== -1) {
            state.manuals[index] = action.payload;
          }
        }
      )
      // Pending/Rejected Matchers
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { clearManualError } = manualSlice.actions;
export default manualSlice.reducer;