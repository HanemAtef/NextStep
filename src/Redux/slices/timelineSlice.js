import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTimeline = createAsyncThunk(
    "timeline/fetchTimeline",
    async (id, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                `https://nextstep.runasp.net/api/Applications/${id}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            // Return the steps array from the response
            return response.data.steps || [];
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "حدث خطأ أثناء جلب البيانات"
            );
        }
    }
);

const timelineSlice = createSlice({
    name: "timeline",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearTimeline: (state) => {
            state.data = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTimeline.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimeline.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchTimeline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearTimeline } = timelineSlice.actions;
export default timelineSlice.reducer;