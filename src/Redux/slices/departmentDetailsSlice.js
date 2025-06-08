import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// تعريف عنوان الـ API
const API_URL = "https://nextstep.runasp.net/api";

// دالة مساعدة للحصول على رأس التوثيق
const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

// دالة مساعدة لتنسيق التواريخ للـ API
const formatDateForAPI = (date) => {
    if (!date) return '';

    try {
        // إذا كان تاريخ بالفعل
        if (date instanceof Date) {
            return encodeURIComponent(date.toISOString());
        }

        // إذا كان نص، نحوله لتاريخ أولاً
        if (typeof date === 'string') {
            return encodeURIComponent(new Date(date).toISOString());
        }

        // احتياطي
        return encodeURIComponent(String(date));
    } catch (error) {
        console.error("خطأ في تنسيق التاريخ:", error, date);
        return '';
    }
};

// جلب تفاصيل الإدارة
export const fetchDepartment = createAsyncThunk(
    'departmentDetails/fetchDepartment',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/departments/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب بيانات الإدارة:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب بيانات الإدارة");
        }
    }
);

// جلب تفاصيل الإدارة
export const fetchDepartmentDetails = createAsyncThunk(
    'departmentDetails/fetchDepartmentDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/departments/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب بيانات الإدارة:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب بيانات الإدارة");
        }
    }
);

// جلب إحصائيات الإدارة
export const fetchDepartmentStats = createAsyncThunk(
    'departmentDetails/fetchDepartmentStats',
    async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/stats`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (startDate && endDate) {
                const formattedStartDate = formatDateForAPI(startDate);
                const formattedEndDate = formatDateForAPI(endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب إحصائيات الإدارة:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب إحصائيات الإدارة");
        }
    }
);

// جلب متوسط وقت المعالجة لكل نوع طلب
export const fetchProcessingTimeStats = createAsyncThunk(
    'departmentDetails/fetchProcessingTimeStats',
    async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/processing-time`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (startDate && endDate) {
                const formattedStartDate = formatDateForAPI(startDate);
                const formattedEndDate = formatDateForAPI(endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error("خطأ في جلب إحصائيات وقت المعالجة:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب إحصائيات وقت المعالجة");
        }
    }
);

// جلب عدد الطلبات لكل نوع
export const fetchRequestsCountByType = createAsyncThunk(
    'departmentDetails/fetchRequestsCountByType',
    async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/requests-count`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (startDate && endDate) {
                const formattedStartDate = formatDateForAPI(startDate);
                const formattedEndDate = formatDateForAPI(endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب عدد الطلبات لكل نوع:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب عدد الطلبات لكل نوع");
        }
    }
);

// اسباب الرفض
export const fetchRejectionReasons = createAsyncThunk(
    'departmentDetails/fetchRejectionReasons',
    async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/rejection-reasons`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (startDate && endDate) {
                const formattedStartDate = formatDateForAPI(startDate);
                const formattedEndDate = formatDateForAPI(endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب أسباب الرفض:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب أسباب الرفض");
        }
    }
);

// جلب التحليل الزمني للطلبات
export const fetchTimeAnalysis = createAsyncThunk(
    'departmentDetails/fetchTimeAnalysis',
    async ({ departmentId, startDate, endDate }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/time-analysis`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (startDate && endDate) {
                const formattedStartDate = formatDateForAPI(startDate);
                const formattedEndDate = formatDateForAPI(endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            console.error(" خطأ في جلب التحليل الزمني:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب التحليل الزمني");
        }
    }
);

// جلب بيانات حالات الطلبات للمخطط الدائري
export const fetchStatusPieChart = createAsyncThunk(
    'departmentDetails/fetchStatusPieChart',
    async ({ departmentId, dateRange }, { rejectWithValue }) => {
        try {
            let url = `${API_URL}/departments/${departmentId}/requests/status`;

            // إضافة معاملات التاريخ إذا كانت متوفرة
            if (dateRange && dateRange.startDate && dateRange.endDate) {
                const formattedStartDate = formatDateForAPI(dateRange.startDate);
                const formattedEndDate = formatDateForAPI(dateRange.endDate);
                url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
            }

            const response = await axios.get(url, { headers: getHeaders() });

            // تحويل البيانات إلى التنسيق المطلوب للمخطط الدائري
            const statusData = response.data;

            // حساب عدد الطلبات قيد التنفيذ بطرح عدد الطلبات المتأخرة من إجمالي عدد الطلبات قيد التنفيذ
            const pendingCount = Math.max(0, (statusData.pending || 0) - (statusData.delayed || 0));

            return {
                labels: ['قيد التنفيذ', 'متأخر', 'مقبول', 'مرفوض'],
                data: [
                    pendingCount,
                    statusData.delayed || 0,
                    statusData.approved || 0,
                    statusData.rejected || 0
                ]
            };
        } catch (error) {
            console.error(" خطأ في جلب بيانات المخطط الدائري:", error);
            return rejectWithValue(error.response?.data || "حدث خطأ في جلب بيانات المخطط الدائري");
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
        rejectedRequests: 0
    },
    processingTimeStats: {
        labels: [],
        data: []
    },
    requestsCountByType: {
        labels: [],
        data: []
    },
    rejectionReasons: {
        labels: [],
        data: []
    },
    timeAnalysis: {
        labels: [],
        receivedData: [],
        processedData: []
    },
    statusPieChart: {
        labels: ['قيد التنفيذ', 'متأخر', 'مقبول', 'مرفوض'],
        data: [0, 0, 0, 0]
    },
    dateRange: {
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        endDate: new Date().toISOString()
    },
    loading: {
        department: false,
        stats: false,
        processingTime: false,
        requestsCount: false,
        rejectionReasons: false,
        timeAnalysis: false,
        statusPieChart: false
    },
    error: {
        department: null,
        stats: null,
        processingTime: null,
        requestsCount: null,
        rejectionReasons: null,
        timeAnalysis: null,
        statusPieChart: null
    }
};

const departmentDetailsSlice = createSlice({
    name: 'departmentDetails',
    initialState,
    reducers: {
        setDateRange: (state, action) => {
            // تحويل أي كائنات Date إلى سلاسل نصية
            const startDate = action.payload.startDate instanceof Date
                ? action.payload.startDate.toISOString()
                : action.payload.startDate;

            const endDate = action.payload.endDate instanceof Date
                ? action.payload.endDate.toISOString()
                : action.payload.endDate;

            state.dateRange = {
                startDate,
                endDate
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // Department
            .addCase(fetchDepartment.pending, (state) => {
                state.loading.department = true;
                state.error.department = null;
            })
            .addCase(fetchDepartment.fulfilled, (state, action) => {
                state.loading.department = false;
                state.department = action.payload;
            })
            .addCase(fetchDepartment.rejected, (state, action) => {
                state.loading.department = false;
                state.error.department = action.payload;
            })

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
                state.error.department = action.payload;
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
                state.error.stats = action.payload;
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
                state.error.processingTime = action.payload;
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
                state.error.requestsCount = action.payload;
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
                state.error.rejectionReasons = action.payload;
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
                state.error.timeAnalysis = action.payload;
            })

            // Status Pie Chart
            .addCase(fetchStatusPieChart.pending, (state) => {
                state.loading.statusPieChart = true;
                state.error.statusPieChart = null;
            })
            .addCase(fetchStatusPieChart.fulfilled, (state, action) => {
                state.loading.statusPieChart = false;
                state.statusPieChart = action.payload;
            })
            .addCase(fetchStatusPieChart.rejected, (state, action) => {
                state.loading.statusPieChart = false;
                state.error.statusPieChart = action.payload;
            });
    }
});

export const { setDateRange } = departmentDetailsSlice.actions;

// Selectors with safe access to prevent undefined errors
export const selectDepartment = (state) => state.departmentDetails?.department;
export const selectStats = (state) => state.departmentDetails?.stats || {
    totalRequests: 0,
    pendingRequests: 0,
    delayedRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
};
export const selectProcessingTimeStats = (state) => state.departmentDetails?.processingTimeStats || { labels: [], data: [] };
export const selectRequestsCountByType = (state) => state.departmentDetails?.requestsCountByType || { labels: [], data: [] };
export const selectRejectionReasons = (state) => state.departmentDetails?.rejectionReasons || { labels: [], data: [] };
export const selectTimeAnalysis = (state) => state.departmentDetails?.timeAnalysis || { labels: [], receivedData: [], processedData: [] };
export const selectStatusPieChart = (state) => state.departmentDetails?.statusPieChart || { labels: ['قيد التنفيذ', 'متأخر', 'مقبول', 'مرفوض'], data: [0, 0, 0, 0] };
export const selectDateRange = (state) => state.departmentDetails?.dateRange || {
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    endDate: new Date().toISOString()
};
export const selectLoading = (state) => state.departmentDetails?.loading || {};
export const selectError = (state) => state.departmentDetails?.error || {};

export default departmentDetailsSlice.reducer; 