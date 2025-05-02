import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_URL = "https://nextstep.runasp.net/api";

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

// Load saved form data from localStorage
const loadSavedFormData = () => {
    try {
        const savedData = localStorage.getItem('createReqFormData');
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error('Error loading saved form data:', error);
        return null;
    }
};

// Save form data to localStorage
const saveFormData = (data) => {
    try {
        localStorage.setItem('createReqFormData', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving form data:', error);
    }
};

export const fetchApplicationTypes = createAsyncThunk(
    "createReq/fetchApplicationTypes",
    async () => {
        try {
            const response = await axios.get(`${API_URL}/ApplicationTypes`, {
                headers: getHeaders()
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching application types:", error);
            throw error;
        }
    }
);

export const fetchConditions = createAsyncThunk(
    "createReq/fetchConditions",
    async (typeId) => {
        try {
            console.log("Fetching conditions for type:", typeId);
            const response = await axios.get(`${API_URL}/ApplicationTypes/${typeId}`, {
                headers: getHeaders()
            });
            console.log("Conditions API response:", response.data);
            const conditions = response.data.requierments.map(requirement => ({
                id: requirement.id,
                text: requirement.name,
                checked: false
            }));
            console.log("Processed conditions:", conditions);
            return conditions;
        } catch (error) {
            console.error("Error fetching conditions:", error);
            throw error;
        }
    }
);

export const submitApplication = createAsyncThunk(
    "createReq/submitApplication",
    async (formData) => {
        try {
            const response = await axios.post(
                `${API_URL}/Applications`,
                formData,
                {
                    headers: {
                        ...getHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error submitting application:", error);
            if (error.response) {
                throw error.response.data;
            }
            throw new Error("حدث خطأ أثناء إرسال الطلب");
        }
    }
);

const initialState = {
    formData: loadSavedFormData() || {
        applicationType: "",
        studentId: "",
        studentName: "",
        studentPhone: "",
        notes: "",
        attachment: null,
    },
    applicationTypes: [],
    conditions: [],
    loading: false,
    error: null,
};

const createReqSlice = createSlice({
    name: "createReq",
    initialState,
    reducers: {
        updateField: (state, action) => {
            const { field, value } = action.payload;
            if (field === "conditions") {
                state.conditions = value;
            } else {
                state.formData[field] = value;
                saveFormData(state.formData);
            }
        },
        resetForm: (state) => {
            state.formData = initialState.formData;
            state.conditions = [];
            localStorage.removeItem('createReqFormData');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApplicationTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplicationTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.applicationTypes = action.payload;
            })
            .addCase(fetchApplicationTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchConditions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConditions.fulfilled, (state, action) => {
                state.loading = false;
                state.conditions = action.payload;
            })
            .addCase(fetchConditions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(submitApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitApplication.fulfilled, (state) => {
                state.loading = false;
                state.formData = initialState.formData;
                state.conditions = [];
                localStorage.removeItem('createReqFormData');
            })
            .addCase(submitApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { updateField, resetForm } = createReqSlice.actions;
export default createReqSlice.reducer;
