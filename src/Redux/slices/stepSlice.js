import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";





export const fetchSteps = createAsyncThunk(
    "steps/fetchSteps",
    async (id, thunkAPI) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return thunkAPI.rejectWithValue("لم يتم العثور على رمز المصادقة");
            }

            const response = await axios.get(
                `https://nextstep.runasp.net/api/Applications/${id}/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const steps = response.data?.steps || [];
            if (!Array.isArray(steps)) {
                return [];
            }

            const formattedSteps = steps.map(step => ({
                departmentName: step.departmentName || 'قسم غير محدد',
                status: step.status || 'غير محدد',
                date: step.date || new Date().toISOString()
            }));

            return formattedSteps;
        } catch (error) {
            let errorMessage = "حدث خطأ أثناء جلب الخطوات";

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

const stepsSlice = createSlice({
    name: "steps",
    initialState: {
        steps: [],
        currentStep: 0,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentStep: (state, action) => {
            state.currentStep = action.payload;
        },
        resetSteps: (state) => {
            state.steps = [];
            state.currentStep = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSteps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSteps.fulfilled, (state, action) => {
                state.loading = false;
                state.steps = action.payload;
                state.currentStep = action.payload.length - 1;
            })
            .addCase(fetchSteps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.steps = [];
                state.currentStep = 0;
            });
    },
});

export const { setCurrentStep, resetSteps } = stepsSlice.actions;
export default stepsSlice.reducer;