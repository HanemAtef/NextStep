// src/Redux/slices/downloadSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const downloadApplicationFile = createAsyncThunk(
    "download/downloadApplicationFile",
    async ({ id }, thunkAPI) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`https://nextstep.runasp.net/api/Applications/${id}/download`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    responseType: 'blob'
                }
            );

            const contentDisposition = response.headers['content-disposition'];
            const contentType = response.headers['content-type'];
            let filename = `application-${id}-file`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            // تحديد امتداد الملف بناءً على نوع المحتوى
            if (contentType) {
                if (contentType.includes('pdf')) {
                    filename += '.pdf';
                } else if (contentType.includes('image')) {
                    const imageType = contentType.split('/')[1];
                    filename += `.${imageType}`;
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();

            // تنظيف
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);

            return { success: true };
        } catch (error) {
            console.error("خطأ في تحميل الملف:", error);
            return thunkAPI.rejectWithValue("حدث خطأ أثناء تحميل الملف");
        }
    }
);

const downloadSlice = createSlice({
    name: "download",
    initialState: {
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(downloadApplicationFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(downloadApplicationFile.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(downloadApplicationFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                alert(action.payload);
            });
    },
});

export default downloadSlice.reducer;