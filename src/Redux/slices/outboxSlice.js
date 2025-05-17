import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = 'https://nextstep.runasp.net';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

export const fetchOutboxRequests = createAsyncThunk(
    "outbox/fetchOutboxRequests",
    async ({ page, pageSize, searchID, status, type }, { rejectWithValue, dispatch, getState }) => {
        try {
            // Get current filters from state
            const state = getState();
            const currentFilters = state.outbox.filters;

            // Use provided filters or fallback to stored filters
            const effectiveSearchID = searchID !== undefined ? searchID : currentFilters.searchID;
            const effectiveStatus = status !== undefined ? status : currentFilters.status;
            const effectiveType = type !== undefined ? type : currentFilters.type;

            // Store new filters if they are different
            if (effectiveSearchID !== currentFilters.searchID ||
                effectiveStatus !== currentFilters.status ||
                effectiveType !== currentFilters.type) {
                dispatch(setFilters({
                    searchID: effectiveSearchID,
                    status: effectiveStatus,
                    type: effectiveType
                }));
            }

            let url = `${BASE_URL}/api/Applications/outbox?page=${page}&limit=${pageSize}`;
            if (effectiveSearchID) url += `&search=${effectiveSearchID}`;
            if (effectiveStatus) url += `&status=${effectiveStatus}`;
            if (effectiveType) url += `&requestType=${effectiveType}`;
            // if (department) url += `&department=${department}`;

            const response = await fetch(
                url,
                { headers: getHeaders() }
            );

            if (!response.ok) {
                throw new Error("فشل في جلب الطلبات الصادرة");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "فشل في جلب الطلبات الصادرة");
        }
    }
);

export const getOutboxRequestDetails = createAsyncThunk(
    "outbox/getOutboxRequestDetails",
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/Applications/${requestId}/details`,
                { headers: getHeaders() }
            );

            if (!response.ok) {
                throw new Error("فشل في جلب تفاصيل الطلب");
            }

            const data = await response.json();

            const transformedData = {
                id: data.applicationId,
                type: data.applicationName,
                status: data.statue,
                studentName: data.studentName,
                nationalId: data.studentNId,
                from: data.createdDepartment,
                date: data.createdDate,
                notes: data.notes,
                fileUrl: data.fileUrl,
                history: data.history?.map(item => ({
                    date: item.actionDate,
                    action: item.action,
                    department: item.department,
                    notes: item.notes
                })) || [],
                steps: data.steps?.map(step => ({
                    department: step.departmentName,
                    order: step.stepOrder,
                    isCompleted: step.isCompleted,
                    isCurrent: step.isCurrent
                })) || [],
                requestType: data.applicationContext
            };

            return transformedData;
        } catch (error) {
            return rejectWithValue(error.message || "فشل في جلب تفاصيل الطلب");
        }
    }
);

const outboxSlice = createSlice({
    name: "outbox",
    initialState: {
        requests: [],
        loading: false,
        error: null,
        requestDetailsLoading: false,
        requestDetailsError: null,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        currentRequest: null,
        filters: {
            searchID: "",
            status: "",
            type: ""
        },
        stats: {
            total: 0,
            new: 0,
            inProgress: 0,
            approved: 0,
            rejected: 0
        },
        lastUpdated: null,
    },
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        resetPage: (state) => {
            state.page = 1;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        setCurrentOutboxRequest: (state, action) => {
            state.currentRequest = action.payload;
        },
        clearCurrentOutboxRequest: (state) => {
            state.currentRequest = null;
        },
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        clearFilters: (state) => {
            state.filters = {
                searchID: "",
                status: "",
                type: ""
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOutboxRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOutboxRequests.fulfilled, (state, action) => {
                state.loading = false;


                if (action.payload.applications) {

                    state.requests = action.payload.applications.map(app => ({
                        id: app.applicationId,
                        type: app.applicationType,
                        to: app.targetDepartment,
                        sentDate: app.sentDate,
                        status: app.status,
                    }));


                    if (action.payload.summary) {
                        state.stats.total = action.payload.summary.totalApplications || 0;
                        state.stats.new = action.payload.summary.newApplications || 0;
                        state.stats.inProgress = action.payload.summary.inProgressApplications || 0;
                        state.stats.approved = action.payload.summary.approvedApplications || 0;
                        state.stats.rejected = action.payload.summary.rejectedApplications || 0;
                    }


                    if (action.payload.pagination) {
                        state.totalCount = action.payload.pagination.totalCount || action.payload.pagination.total || state.requests.length;
                    } else if (action.payload.summary) {
                        state.totalCount = action.payload.summary.totalApplications || state.requests.length;
                    } else {
                        state.totalCount = state.requests.length;
                    }
                } else {

                    state.requests = Array.isArray(action.payload.data) ? action.payload.data :
                        Array.isArray(action.payload) ? action.payload : [];

                    if (action.payload.pagination) {
                        state.totalCount = action.payload.pagination.totalCount || action.payload.pagination.total || state.requests.length;
                    } else {
                        state.totalCount = state.requests.length;
                    }

                    state.stats.total = state.requests.length;
                    state.stats.new = state.requests.filter(req =>
                        req && (req.status === "New" || req.status === "طلب جديد")
                    ).length;
                    state.stats.inProgress = state.requests.filter(req =>
                        req && (req.status === "قيد_التنفيذ" ||
                            req.status === "قيد المراجعة" ||
                            req.status === "قيد التنفيذ" ||
                            req.status === "InProgress")
                    ).length;
                    state.stats.approved = state.requests.filter(req =>
                        req && (req.status === "Accepted" || req.status === "مقبول")
                    ).length;
                    state.stats.rejected = state.requests.filter(req =>
                        req && (req.status === "Rejected" || req.status === "مرفوض")
                    ).length;
                }

                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchOutboxRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })


    }
});

export const {
    setPage,
    resetPage,
    setPageSize,
    setCurrentOutboxRequest,
    clearCurrentOutboxRequest,
    setFilters,
    clearFilters
} = outboxSlice.actions;

export default outboxSlice.reducer;

// Selectors
export const selectOutboxRequests = (state) => state.outbox.requests;
export const selectOutboxLoading = (state) => state.outbox.loading;
export const selectOutboxError = (state) => state.outbox.error;
export const selectOutboxStats = (state) => state.outbox.stats;
export const selectCurrentOutboxRequest = (state) => state.outbox.currentRequest;
export const selectRequestDetailsLoading = (state) => state.outbox.requestDetailsLoading;
export const selectRequestDetailsError = (state) => state.outbox.requestDetailsError;
export const selectOutboxPage = (state) => state.outbox.page;
export const selectOutboxPageSize = (state) => state.outbox.pageSize;
export const selectOutboxTotalCount = (state) => state.outbox.totalCount;
export const selectOutboxFilters = (state) => state.outbox.filters;
export const selectLastUpdatedOutbox = (state) => state.outbox.lastUpdated;
