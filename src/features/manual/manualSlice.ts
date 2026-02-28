import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import * as service from "./manualService";
import { type IManual, type PostEntryPayload } from "./manualService";

/* ===============================
    STATE INTERFACE
================================ */
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

/** USER FETCH */
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

/** ADMIN FETCH */
export const fetchAdminManuals = createAsyncThunk(
  "manual/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      return await service.getAdminManuals();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Admin fetch failed");
    }
  }
);

/** POST ENTRY */
export const postEntry = createAsyncThunk(
  "manual/postEntry",
  async (payload: PostEntryPayload, { rejectWithValue }) => {
    try {
      return await service.addManualEntry(payload);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || `Failed to post ${payload.type}`
      );
    }
  }
);

/** DOWNLOAD PDF REPORT (optional individual user) */
export const downloadReport = createAsyncThunk<
  void,                   // return type
  string | undefined       // payload type (userId optional)
>(
  "manual/downloadReport",
  async (userId, { rejectWithValue }) => {
    try {
      await service.downloadManualReport(userId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Download failed");
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
      /* USER FETCH */
      .addCase(fetchManuals.fulfilled, (state, action: PayloadAction<IManual[]>) => {
        state.loading = false;
        state.manuals = action.payload;
        state.error = null;
      })

      /* ADMIN FETCH */
      .addCase(fetchAdminManuals.fulfilled, (state, action: PayloadAction<IManual[]>) => {
        state.loading = false;
        state.adminManuals = action.payload;
        state.error = null;
      })

      /* UPDATE AFTER POST */
      .addCase(postEntry.fulfilled, (state, action: PayloadAction<IManual>) => {
        state.loading = false;
        state.error = null;
        const index = state.manuals.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.manuals[index] = action.payload;
      })

      /* GLOBAL PENDING */
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      /* GLOBAL REJECTED */
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
