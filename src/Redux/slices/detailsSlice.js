// src/Redux/slices/detailsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error("لم يتم العثور على رمز المصادقة. الرجاء تسجيل الدخول مرة أخرى.");
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const fetchApplicationDetails = createAsyncThunk(
    'details/fetchApplicationDetails',
    async (id, { rejectWithValue }) => {
        try {
            const headers = getHeaders();
            const response = await axios.get(`https://nextstep.runasp.net/api/Applications/${id}/details`, { headers });
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue("انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.");
            }
            return rejectWithValue(error.message || "حدث خطأ أثناء جلب تفاصيل الطلب");
        }
    }
);

const detailsSlice = createSlice({
    name: "details",
    initialState: {
        data: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchApplicationDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchApplicationDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default detailsSlice.reducer;