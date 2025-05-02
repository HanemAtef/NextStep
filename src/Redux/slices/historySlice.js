// src/redux/historySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchHistory = createAsyncThunk(
    "history/fetchHistory",
    async (id, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`https://nextstep.runasp.net/api/Applications/${id}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data.history || []; 
        } catch (error) {
            let errorMessage = "حدث خطأ أثناء جلب البيانات";

            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
                    errorMessage = error.response.data.errors.join(', ');
                }
            }

            return thunkAPI.rejectWithValue(errorMessage);
        }
    }
);

const historySlice = createSlice({
    name: "history",
    initialState: {
        data: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload || [];
            })
            .addCase(fetchHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default historySlice.reducer;