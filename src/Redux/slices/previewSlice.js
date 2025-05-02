import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const approveApplication = createAsyncThunk(
    "preview/approveApplication",
    async (formData, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");

            if (!formData.get("ApplicationID")) {
                throw new Error("رقم الطلب مطلوب");
            }
            if (!formData.get("Attachment")) {
                throw new Error("الملف مطلوب");
            }
            if (!formData.get("Notes")) {
                throw new Error("الملاحظات مطلوبة");
            }

            const response = await axios.post(
                "https://nextstep.runasp.net/api/Applications/approve",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error in approveApplication:", error);
            return thunkAPI.rejectWithValue(error.response?.data?.title || error.message || "حدث خطأ أثناء الموافقة");
        }
    }
);

export const rejectApplication = createAsyncThunk(
    "preview/rejectApplication",
    async (formData, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");

            if (!formData.get("ApplicationID")) {
                throw new Error("رقم الطلب مطلوب");
            }
            if (!formData.get("Attachment")) {
                throw new Error("الملف مطلوب");
            }
            if (!formData.get("Notes")) {
                throw new Error("الملاحظات مطلوبة");
            }

            const response = await axios.post(
                "https://nextstep.runasp.net/api/Applications/reject",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error in rejectApplication:", error);
            return thunkAPI.rejectWithValue(error.response?.data?.title || error.message || "حدث خطأ أثناء الرفض");
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
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        }
    },
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

export const { clearError, clearSuccessMessage } = previewSlice.actions;
export default previewSlice.reducer;