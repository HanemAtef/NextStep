import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// الدالة الخاصة بالموافقة
export const approveApplication = createAsyncThunk(
    "preview/approveApplication",
    async (applicationData, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");
            console.log("Sending data:", applicationData); // عرض البيانات المرسلة للـ API
            const response = await axios.post(
                "https://nextstep.runasp.net/api/Applications/approve",
                applicationData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            return response.data;
        } catch (error) {
            console.error("Error details:", error.response ? error.response.data : error.message); // إضافة log للتفاصيل
            if (error.response && error.response.data.errors) {
                console.error("Validation errors:", error.response.data.errors); // طباعة الأخطاء الخاصة بالتحقق
            }
            return thunkAPI.rejectWithValue(error.response?.data?.title || "حدث خطأ أثناء الموافقة");
        }
    }
);

// الدالة الخاصة بالرفض
export const rejectApplication = createAsyncThunk(
    "preview/rejectApplication",
    async (applicationData, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.post(
                "https://nextstep.runasp.net/api/Applications/reject",
                applicationData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            return response.data;
        } catch (error) {
            console.error("Error details:", error.response); // إضافة log للتفاصيل
            return thunkAPI.rejectWithValue(error.response?.data?.title || "حدث خطأ أثناء الرفض");
        }
    }
);

const previewSlice = createSlice({
    name: "preview",
    initialState: {
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // حالة الموافقة
            .addCase(approveApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(approveApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "تمت الموافقة على الطلب بنجاح!";
            })
            .addCase(approveApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // حالة الرفض
            .addCase(rejectApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(rejectApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = "تم رفض الطلب بنجاح!";
            })
            .addCase(rejectApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default previewSlice.reducer;