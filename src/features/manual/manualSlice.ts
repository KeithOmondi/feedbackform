import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import * as service from "./manualService";
import { type IManual, type PostEntryPayload } from "./manualService";

interface ManualState {
  manuals: IManual[];
  adminManuals: IManual[];
  loading: boolean;
  error: string | null;
}

const initialState: ManualState = {
  manuals: [],
  adminManuals: [],
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
  },
);

export const fetchAdminManuals = createAsyncThunk(
  "manual/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await service.getAdminManuals();
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Admin fetch failed",
      );
    }
  },
);

export const postEntry = createAsyncThunk(
  "manual/postEntry",
  async (payload: PostEntryPayload, { rejectWithValue }) => {
    try {
      return await service.addManualEntry(payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || `Failed to post ${payload.type}`,
      );
    }
  },
);

export const downloadReport = createAsyncThunk<void, string | undefined>(
  "manual/downloadReport",
  async (userId, { rejectWithValue }) => {
    try {
      await service.downloadManualReport(userId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Download failed");
    }
  },
);

export const deleteEntry = createAsyncThunk(
  "manual/deleteEntry",
  async (
    payload: { sectionId: string; entryType: string; entryId: string },
    { rejectWithValue }
  ) => {
    try {
      return await service.removeManualEntry(
        payload.sectionId,
        payload.entryType,
        payload.entryId
      );
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || `Failed to delete ${payload.entryType}`
      );
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
      .addCase(
        fetchManuals.fulfilled,
        (state, action: PayloadAction<IManual[]>) => {
          state.loading = false;
          state.manuals = action.payload;
        },
      )
      .addCase(
        fetchAdminManuals.fulfilled,
        (state, action: PayloadAction<IManual[]>) => {
          state.loading = false;
          state.adminManuals = action.payload;
        },
      )

      // inside manualSlice.ts extraReducers:
.addCase(deleteEntry.fulfilled, (state, action: PayloadAction<IManual>) => {
  state.loading = false;

  // Update User View array
  const userIdx = state.manuals.findIndex((m) => m._id === action.payload._id);
  if (userIdx !== -1) state.manuals[userIdx] = action.payload;

  // Update Admin View array
  const adminIdx = state.adminManuals.findIndex((m) => m._id === action.payload._id);
  if (adminIdx !== -1) state.adminManuals[adminIdx] = action.payload;
})
      .addCase(postEntry.fulfilled, (state, action: PayloadAction<IManual>) => {
        state.loading = false;

        // Update User View array
        const userIdx = state.manuals.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (userIdx !== -1) state.manuals[userIdx] = action.payload;

        // Update Admin View array
        const adminIdx = state.adminManuals.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (adminIdx !== -1) state.adminManuals[adminIdx] = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        },
      );
  },
});

export const { clearManualError } = manualSlice.actions;
export default manualSlice.reducer;
