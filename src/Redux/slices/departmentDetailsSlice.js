import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const fetchDepartmentDetails = createAsyncThunk(
    'departmentDetails/fetchDepartmentDetails',
    async (id) => {
        try {
            const response = await axios.get(`/api/departments/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// جلب إحصائيات الإدارة
export const fetchDepartmentStats = createAsyncThunk(
    'departmentDetails/fetchDepartmentStats',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/stats`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// جلب متوسط وقت المعالجة لكل نوع طلب
export const fetchProcessingTimeStats = createAsyncThunk(
    'departmentDetails/fetchProcessingTimeStats',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/processing-time`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// جلب عدد الطلبات لكل نوع
export const fetchRequestsCountByType = createAsyncThunk(
    'departmentDetails/fetchRequestsCountByType',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/requests-count`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);
// اسباب الرفض
export const fetchRejectionReasons = createAsyncThunk(
    'departmentDetails/fetchRejectionReasons',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/rejection-reasons`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// جلب التحليل الزمني للطلبات
export const fetchTimeAnalysis = createAsyncThunk(
    'departmentDetails/fetchTimeAnalysis',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/time-analysis`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

// جلب بيانات حالات الطلبات للمخطط الدائري
export const fetchRequestStatusPieChart = createAsyncThunk(
    'departmentDetails/fetchRequestStatusPieChart',
    async ({ departmentId, startDate, endDate }) => {
        try {
            const response = await axios.get(`/api/departments/${departmentId}/status-distribution`, {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

const initialState = {
    department: null,
    stats: {
        totalRequests: 0,
        pendingRequests: 0,
        delayedRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        createdRequests: 0,
        receivedRequests: 0
    },
    processingTimeStats: [],
    requestsCountByType: [],
    timeAnalysis: {
        receivedData: [],
        processedData: [],
        timeLabels: []
    },
    statusPieChart: {
        labels: ['قيد التنفيذ', 'متأخر', 'مقبول', 'مرفوض'],
        data: [0, 0, 0, 0]
    },
    dateRange: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    },
    loading: {
        department: false,
        stats: false,
        processingTime: false,
        requestsCount: false,
        timeAnalysis: false,
        statusPieChart: false
    },
    error: {
        department: null,
        stats: null,
        processingTime: null,
        requestsCount: null,
        timeAnalysis: null,
        statusPieChart: null
    }
};

const departmentDetailsSlice = createSlice({
    name: 'departmentDetails',
    initialState,
    reducers: {
        setDateRange: (state, action) => {
            state.dateRange = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Department Details
            .addCase(fetchDepartmentDetails.pending, (state) => {
                state.loading.department = true;
                state.error.department = null;
            })
            .addCase(fetchDepartmentDetails.fulfilled, (state, action) => {
                state.loading.department = false;
                state.department = action.payload;
            })
            .addCase(fetchDepartmentDetails.rejected, (state, action) => {
                state.loading.department = false;
                state.error.department = action.error.message;
            })

            // Department Stats
            .addCase(fetchDepartmentStats.pending, (state) => {
                state.loading.stats = true;
                state.error.stats = null;
            })
            .addCase(fetchDepartmentStats.fulfilled, (state, action) => {
                state.loading.stats = false;
                state.stats = action.payload;
            })
            .addCase(fetchDepartmentStats.rejected, (state, action) => {
                state.loading.stats = false;
                state.error.stats = action.error.message;
            })

            // Processing Time Stats
            .addCase(fetchProcessingTimeStats.pending, (state) => {
                state.loading.processingTime = true;
                state.error.processingTime = null;
            })
            .addCase(fetchProcessingTimeStats.fulfilled, (state, action) => {
                state.loading.processingTime = false;
                state.processingTimeStats = action.payload;
            })
            .addCase(fetchProcessingTimeStats.rejected, (state, action) => {
                state.loading.processingTime = false;
                state.error.processingTime = action.error.message;
            })

            // Requests Count By Type
            .addCase(fetchRequestsCountByType.pending, (state) => {
                state.loading.requestsCount = true;
                state.error.requestsCount = null;
            })
            .addCase(fetchRequestsCountByType.fulfilled, (state, action) => {
                state.loading.requestsCount = false;
                state.requestsCountByType = action.payload;
            })
            .addCase(fetchRequestsCountByType.rejected, (state, action) => {
                state.loading.requestsCount = false;
                state.error.requestsCount = action.error.message;
            })
            // اسباب الرفض
            .addCase(fetchRejectionReasons.pending, (state) => {
                state.loading.rejectionReasons = true;
                state.error.rejectionReasons = null;
            })
            .addCase(fetchRejectionReasons.fulfilled, (state, action) => {
                state.loading.rejectionReasons = false;
                state.rejectionReasons = action.payload;
            })
            .addCase(fetchRejectionReasons.rejected, (state, action) => {
                state.loading.rejectionReasons = false;
                state.error.rejectionReasons = action.error.message;
            })
            // Time Analysis
            .addCase(fetchTimeAnalysis.pending, (state) => {
                state.loading.timeAnalysis = true;
                state.error.timeAnalysis = null;
            })
            .addCase(fetchTimeAnalysis.fulfilled, (state, action) => {
                state.loading.timeAnalysis = false;
                state.timeAnalysis = action.payload;
            })
            .addCase(fetchTimeAnalysis.rejected, (state, action) => {
                state.loading.timeAnalysis = false;
                state.error.timeAnalysis = action.error.message;
            })

            // Status Pie Chart
            .addCase(fetchRequestStatusPieChart.pending, (state) => {
                state.loading.statusPieChart = true;
                state.error.statusPieChart = null;
            })
            .addCase(fetchRequestStatusPieChart.fulfilled, (state, action) => {
                state.loading.statusPieChart = false;
                state.statusPieChart = action.payload;
            })
            .addCase(fetchRequestStatusPieChart.rejected, (state, action) => {
                state.loading.statusPieChart = false;
                state.error.statusPieChart = action.error.message;
            });
    }
});

export const { setDateRange } = departmentDetailsSlice.actions;

// Selectors
export const selectDepartment = (state) => state.departmentDetails.department;
export const selectStats = (state) => state.departmentDetails.stats;
export const selectProcessingTimeStats = (state) => state.departmentDetails.processingTimeStats;
export const selectRequestsCountByType = (state) => state.departmentDetails.requestsCountByType;
export const selectTimeAnalysis = (state) => state.departmentDetails.timeAnalysis;
export const selectStatusPieChart = (state) => state.departmentDetails.statusPieChart;
export const selectDateRange = (state) => state.departmentDetails.dateRange;
export const selectLoading = (state) => state.departmentDetails.loading;
export const selectError = (state) => state.departmentDetails.error;

export default departmentDetailsSlice.reducer; 