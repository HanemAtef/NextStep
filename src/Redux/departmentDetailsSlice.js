import { createSlice } from '@reduxjs/toolkit';

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
    rejectionReasons: {
        paperwork: 40, // نقص في الأوراق
        deadline: 25,  // انتهاء معاد القيد
        failed: 20,    // لم يجتاز
        other: 15      // أسباب أخرى
    },
    dateRange: [null, null],
    loading: false,
    error: null
};

const departmentDetailsSlice = createSlice({
    name: 'departmentDetails',
    initialState,
    reducers: {
        setDepartment: (state, action) => {
            state.department = action.payload;
        },
        setStats: (state, action) => {
            state.stats = action.payload;
        },
        setRejectionReasons: (state, action) => {
            state.rejectionReasons = action.payload;
        },
        setDateRange: (state, action) => {
            state.dateRange = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setDepartment,
    setStats,
    setRejectionReasons,
    setDateRange,
    setLoading,
    setError
} = departmentDetailsSlice.actions;

export const selectDepartment = (state) => state.departmentDetails.department;
export const selectStats = (state) => state.departmentDetails.stats;
export const selectRejectionReasons = (state) => state.departmentDetails.rejectionReasons;
export const selectDateRange = (state) => state.departmentDetails.dateRange;
export const selectLoading = (state) => state.departmentDetails.loading;
export const selectError = (state) => state.departmentDetails.error;

export default departmentDetailsSlice.reducer; 