import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://nextstep.runasp.net';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

export const fetchInboxRequests = createAsyncThunk(
    "inbox/fetchRequests",
    async ({ page, pageSize, searchID, status, type, department }, { rejectWithValue }) => {
        try {
            let url = `${BASE_URL}/api/Applications/inbox?page=${page}&limit=${pageSize}`;

            if (searchID) url += `&search=${searchID}`;
            if (status) url += `&status=${status}`;
            if (type) url += `&requestType=${type}`;
            // if (department) url += `&department=${department}`;
            console.log("Inbox API Request URL:", url);
            console.log("Inbox Filter Parameters:", { page, pageSize, searchID, status, type });
            // console.log("Department filter provided but not supported by the API:", department);

            const response = await axios.get(url, {
                headers: getHeaders(),
            });

            console.log("Inbox API Response:", response.data);

            return response.data;
        } catch (error) {
            console.error("Inbox API Error:", error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch inbox requests"
            );
        }
    }
);

export const getInboxRequestDetails = createAsyncThunk(
    "inbox/getInboxRequestDetails",
    async (requestId, { rejectWithValue }) => {
        try {
            const response = await fetch(`https://nextstep.runasp.net/api/Applications/inbox/${requestId}`, { headers: getHeaders() });
            if (!response.ok) throw new Error("فشل في جلب تفاصيل الطلب");
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "فشل في جلب تفاصيل الطلب");
        }
    }
);

const inboxSlice = createSlice({
    name: 'inbox',
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
        stats: {
            total: 0,
            new: 0,
            inProgress: 0
        },
        lastUpdated: null,
    },
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
        },
        setCurrentInboxRequest: (state, action) => {
            state.currentRequest = action.payload;
        },
        clearCurrentInboxRequest: (state) => {
            state.currentRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInboxRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInboxRequests.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload.applications) {
                    state.requests = action.payload.applications.map(app => ({
                        id: app.applicationId,
                        type: app.applicationType,
                        from: app.sendingDepartment,
                        receivedDate: app.sentDate,
                        status: app.status,
                        finalDesicion: app.status !== "طلب_جديد" ? app.status : null
                    }));

                    if (action.payload.summary) {
                        state.stats.total = action.payload.summary.totalApplications;
                        state.stats.new = action.payload.summary.newApplications;
                        state.stats.inProgress = action.payload.summary.totalApplications -
                            action.payload.summary.newApplications -
                            action.payload.summary.answeredApplications;
                    }
                } else {
                    state.requests = action.payload.data || action.payload;
                }

                state.lastUpdated = new Date().toISOString();

                if (action.payload.pagination) {
                    state.totalCount = action.payload.pagination.totalCount || action.payload.pagination.total;
                } else if (action.payload.summary) {
                    state.totalCount = action.payload.summary.totalApplications;
                }

                if (!action.payload.summary) {
                    const requests = state.requests;
                    state.stats.total = requests.length;
                    state.stats.new = requests.filter((r) =>
                        r.status === "New" ||
                        r.status === "طلب_جديد" ||
                        r.status === "طلب جديد"
                    ).length;
                    state.stats.inProgress = requests.filter((r) =>
                        r.status === "InProgress" ||
                        r.status === "قيد التنفيذ" ||
                        r.status === "قيد المراجعة"
                    ).length;
                }
            })
            .addCase(fetchInboxRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ أثناء تحميل الطلبات';
            })

            .addCase(getInboxRequestDetails.pending, (state) => {
                state.requestDetailsLoading = true;
                state.requestDetailsError = null;
            })
            .addCase(getInboxRequestDetails.fulfilled, (state, action) => {
                state.requestDetailsLoading = false;
                state.currentRequest = action.payload;
            })
            .addCase(getInboxRequestDetails.rejected, (state, action) => {
                state.requestDetailsLoading = false;
                state.requestDetailsError = action.payload;
            });
    },
});

export const {
    setPage,
    setPageSize,
    setCurrentInboxRequest,
    clearCurrentInboxRequest,
} = inboxSlice.actions;

export default inboxSlice.reducer;

//  Selectors
export const selectInboxRequests = state => state.inbox.requests;
export const selectInboxLoading = state => state.inbox.loading;
export const selectInboxError = state => state.inbox.error;
export const selectInboxStats = state => state.inbox.stats;
export const selectCurrentInboxRequest = state => state.inbox.currentRequest;
export const selectRequestDetailsLoading = state => state.inbox.requestDetailsLoading;
export const selectRequestDetailsError = state => state.inbox.requestDetailsError;
export const selectInboxPage = state => state.inbox.page;
export const selectInboxPageSize = state => state.inbox.pageSize;
export const selectInboxTotalCount = state => state.inbox.totalCount;
export const selectLastUpdatedInbox = state => state.inbox.lastUpdated;