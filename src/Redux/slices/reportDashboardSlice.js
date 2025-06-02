import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const fetchDepartments = createAsyncThunk(
    'reportDashboard/fetchDepartments',
    async () => {
        try {
            const response = await axios.get('https://nextstep.runasp.net/api/Departments');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// متوسط المعالجة للأقسام
export const fetchProcessingAverage = createAsyncThunk(
    'reportDashboard/fetchProcessingAverage',
    async ({ startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/reports/processing-average`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// عدد الطلبات في حالة معينة لكل إدارة
export const fetchRequestsByStatus = createAsyncThunk(
    'reportDashboard/fetchRequestsByStatus',
    async ({ startDate, endDate, status }) => {
        try {
            const response = await axios.get(`/api/reports/requests-by-status`, {
                params: { startDate, endDate, status }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// عدد الطلبات المنشأة في الفترة المحددة
export const fetchCreatedRequests = createAsyncThunk(
    'reportDashboard/fetchCreatedRequests',
    async ({ startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/reports/created-requests`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// العدد الإجمالي للطلبات في كل إدارة
export const fetchTotalRequestsByDepartment = createAsyncThunk(
    'reportDashboard/fetchTotalRequestsByDepartment',
    async ({ startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/reports/total-by-department`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

const initialState = {
    departments: [],
    processingAverage: [],
    requestsByStatus: [],
    createdRequests: [],
    totalByDepartment: [],
    dateRange: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    },
    loading: {
        departments: false,
        processingAverage: false,
        requestsByStatus: false,
        createdRequests: false,
        totalByDepartment: false
    },
    error: {
        departments: null,
        processingAverage: null,
        requestsByStatus: null,
        createdRequests: null,
        totalByDepartment: null
    }
};

const reportDashboardSlice = createSlice({
    name: 'reportDashboard',
    initialState,
    reducers: {
        setDateRange: (state, action) => {
            state.dateRange = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Departments
            .addCase(fetchDepartments.pending, (state) => {
                state.loading.departments = true;
                state.error.departments = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading.departments = false;
                state.departments = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading.departments = false;
                state.error.departments = action.error.message;
            })

            // Processing Average
            .addCase(fetchProcessingAverage.pending, (state) => {
                state.loading.processingAverage = true;
                state.error.processingAverage = null;
            })
            .addCase(fetchProcessingAverage.fulfilled, (state, action) => {
                state.loading.processingAverage = false;
                state.processingAverage = action.payload;
            })
            .addCase(fetchProcessingAverage.rejected, (state, action) => {
                state.loading.processingAverage = false;
                state.error.processingAverage = action.error.message;
            })

            // Requests By Status
            .addCase(fetchRequestsByStatus.pending, (state) => {
                state.loading.requestsByStatus = true;
                state.error.requestsByStatus = null;
            })
            .addCase(fetchRequestsByStatus.fulfilled, (state, action) => {
                state.loading.requestsByStatus = false;
                state.requestsByStatus = action.payload;
            })
            .addCase(fetchRequestsByStatus.rejected, (state, action) => {
                state.loading.requestsByStatus = false;
                state.error.requestsByStatus = action.error.message;
            })

            // Created Requests
            .addCase(fetchCreatedRequests.pending, (state) => {
                state.loading.createdRequests = true;
                state.error.createdRequests = null;
            })
            .addCase(fetchCreatedRequests.fulfilled, (state, action) => {
                state.loading.createdRequests = false;
                state.createdRequests = action.payload;
            })
            .addCase(fetchCreatedRequests.rejected, (state, action) => {
                state.loading.createdRequests = false;
                state.error.createdRequests = action.error.message;
            })

            // Total By Department
            .addCase(fetchTotalRequestsByDepartment.pending, (state) => {
                state.loading.totalByDepartment = true;
                state.error.totalByDepartment = null;
            })
            .addCase(fetchTotalRequestsByDepartment.fulfilled, (state, action) => {
                state.loading.totalByDepartment = false;
                state.totalByDepartment = action.payload;
            })
            .addCase(fetchTotalRequestsByDepartment.rejected, (state, action) => {
                state.loading.totalByDepartment = false;
                state.error.totalByDepartment = action.error.message;
            });
    }
});

export const { setDateRange } = reportDashboardSlice.actions;

// Selectors
export const selectDepartments = (state) => state.reportDashboard.departments;
export const selectProcessingAverage = (state) => state.reportDashboard.processingAverage;
export const selectRequestsByStatus = (state) => state.reportDashboard.requestsByStatus;
export const selectCreatedRequests = (state) => state.reportDashboard.createdRequests;
export const selectTotalByDepartment = (state) => state.reportDashboard.totalByDepartment;
export const selectDateRange = (state) => state.reportDashboard.dateRange;
export const selectLoading = (state) => state.reportDashboard.loading;
export const selectError = (state) => state.reportDashboard.error;

export default reportDashboardSlice.reducer; 