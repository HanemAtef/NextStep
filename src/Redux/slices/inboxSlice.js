import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "https://nextstep.runasp.net";

const getHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

const APPLICATION_TYPE_MAPPING = {
  "طلب الالتحاق الخاص بقسم نظم المعلومات": 2,
  "طلب الالتحاق الخاص بقسم حسابات علميه": 3,
  "طلب الالتحاق الخاص بقسم ذكاء اصطناعي": 4,
  "طلب مد الخاص بقسم نظم المعلومات": 6,
  "طلب مد الخاص بقسم ذكاء اصطناعي": 8,
  "ايقاف قيد الخاص بقسم علوم حاسب": 9,
  "ايقاف قيد الخاص بقسم نظم المعلومات": 10,
  "ايقاف قيد الخاص بقسم حسابات علميه": 11,
  "ايقاف قيد الخاص بقسم ذكاء اصطناعي": 12,
  "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم علوم حاسب": 17,
  "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم نظم المعلومات": 18,
  "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم حسابات علميه": 19,
  "سيمنار 1 تعيين لجنة الاشراف والخطه البحثيه الخاص بقسم ذكاء اصطناعي": 20,
  "سيمنار 2 صلاحية الخاص بقسم علوم حاسب": 21,
  "سيمنار 2 صلاحية الخاص بقسم نظم المعلومات": 22,
  "سيمنار 2 صلاحية الخاص بقسم حسابات علميه": 23,
  "سيمنار 2 صلاحية الخاص بقسم ذكاء اصطناعي": 24,
  "سيمنار مناقشة الخاص بقسم علوم حاسب": 29,
  "سيمنار مناقشة الخاص بقسم نظم المعلومات": 30,
  "سيمنار مناقشة الخاص بقسم حسابات علميه": 31,
  "سيمنار مناقشة الخاص بقسم ذكاء اصطناعي": 32,
  "منح الخاص بقسم علوم حاسب": 33,
  "منح الخاص بقسم نظم المعلومات": 34,
  "منح الخاص بقسم حسابات علميه": 35,
  "منح الخاص بقسم ذكاء اصطناعي": 36,
  "طلب الالتحاق الخاص بقسم علوم الحاسب": 108,
  "طلب مد الخاص بقسم علوم الحاسب": 109,
  "طلب مد الخاص بقسم الحسابات العلمية": 110,
  "الغاء تسجيل الخاص بقسم نظم المعلومات": 113,
  "الغاء تسجيل الخاص بقسم علوم الحاسب": 114,
  "الغاء تسجيل الخاص بقسم ذكاء اصطناعى": 115,
  "الغاء تسجيل الخاص بقسم الحسابات العلمية": 116,
  "تشكيل لجنة الحكم والمناقشة الخاص بقسم علوم حاسب": 117,
  "تشكيل لجنة الحكم والمناقشة الخاص بقسم نظم المعلومات": 118,
  "تشكيل لجنة الحكم والمناقشة الخاص بقسم ذكاء اصطناعى": 119,
  "تشكيل لجنة الحكم والمناقشة الخاص بقسم حسابات علمية": 120,
};

export const fetchInboxRequests = createAsyncThunk(
  "inbox/fetchRequests",
  async (
    { page, pageSize, searchID, status, type, department },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      // Get current filters from state
      const state = getState();
      const currentFilters = state.inbox.filters;

      // Use provided filters or fallback to stored filters
      const effectiveSearchID =
        searchID !== undefined ? searchID : currentFilters.searchID;
      const effectiveStatus =
        status !== undefined ? status : currentFilters.status;
      const effectiveType = type !== undefined ? type : currentFilters.type;

      // Store new filters if they are different
      if (
        effectiveSearchID !== currentFilters.searchID ||
        effectiveStatus !== currentFilters.status ||
        effectiveType !== currentFilters.type
      ) {
        dispatch(
          setFilters({
            searchID: effectiveSearchID,
            status: effectiveStatus,
            type: effectiveType,
          })
        );
      }

      let url = `${BASE_URL}/api/Applications/inbox?page=${page}&limit=${pageSize}`;

      if (effectiveSearchID) url += `&search=${effectiveSearchID}`;
      if (effectiveStatus) url += `&status=${effectiveStatus}`;
      if (effectiveType) url += `&requestType=${effectiveType}`;
      if (department) url += `&department=${department}`;

      const response = await fetch(url, { headers: getHeaders() });

      if (!response.ok) {
        throw new Error("فشل في جلب الطلبات الواردة");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جلب الطلبات الواردة");
    }
  }
);

export const getInboxRequestDetails = createAsyncThunk(
  "inbox/getInboxRequestDetails",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/Applications/${requestId}/details`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error("فشل في جلب تفاصيل الطلب");
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
        history:
          data.history?.map((item) => ({
            date: item.actionDate,
            action: item.action,
            department: item.department,
            notes: item.notes,
          })) || [],
        steps:
          data.steps?.map((step) => ({
            department: step.departmentName,
            order: step.stepOrder,
            isCompleted: step.isCompleted,
            isCurrent: step.isCurrent,
          })) || [],
        requestType: data.applicationContext,
      };
      return transformedData;
    } catch (error) {
      return rejectWithValue(error.message || "فشل في جلب تفاصيل الطلب");
    }
  }
);

const inboxSlice = createSlice({
  name: "inbox",
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
      type: "",
    },
    stats: {
      total: 0,
      new: 0,
      inProgress: 0,
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
    setCurrentInboxRequest: (state, action) => {
      state.currentRequest = action.payload;
    },
    clearCurrentInboxRequest: (state) => {
      state.currentRequest = null;
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = {
        searchID: "",
        status: "",
        type: "",
      };
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
        // console.log("Redux Action Payload:", action.payload);

        if (action.payload && action.payload.applications) {
          // console.log("Processing applications:", action.payload.applications);
          state.requests = action.payload.applications.map((app) => {
            // console.log("Mapping application:", app);
            const mappedApp = {
              id: app.applicationId,
              type: app.applicationType,
              from: app.sendingDepartment,
              receivedDate: app.sentDate,
              status: app.status,
              finalDesicion: app.status !== "طلب_جديد" ? app.status : null,
              applicationTypeId:
                APPLICATION_TYPE_MAPPING[app.applicationType] ||
                app.applicationTypeId ||
                app.typeId,
            };
            // console.log("Mapped application:", mappedApp);
            return mappedApp;
          });

          // console.log("Mapped requests:", state.requests);

          if (action.payload.summary) {
            state.stats.total = action.payload.summary.totalApplications || 0;
            state.stats.new = action.payload.summary.newApplications || 0;
            state.stats.inProgress =
              action.payload.summary.totalApplications -
                action.payload.summary.newApplications -
                action.payload.summary.answeredApplications || 0;
          }

          if (action.payload.pagination) {
            state.totalCount =
              action.payload.pagination.totalCount ||
              action.payload.pagination.total ||
              state.requests.length;
          } else if (action.payload.summary) {
            state.totalCount =
              action.payload.summary.totalApplications || state.requests.length;
          } else {
            state.totalCount = state.requests.length;
          }
        } else {
          // console.log("No applications in payload");
          state.requests = [];
          state.totalCount = 0;
          state.stats.total = 0;
          state.stats.new = 0;
          state.stats.inProgress = 0;
        }

        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchInboxRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
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
  resetPage,
  setPageSize,
  setCurrentInboxRequest,
  clearCurrentInboxRequest,
  setFilters,
  clearFilters,
} = inboxSlice.actions;

export default inboxSlice.reducer;

//  Selectors
export const selectInboxRequests = (state) => state.inbox.requests;
export const selectInboxLoading = (state) => state.inbox.loading;
export const selectInboxError = (state) => state.inbox.error;
export const selectInboxStats = (state) => state.inbox.stats;
export const selectCurrentInboxRequest = (state) => state.inbox.currentRequest;
export const selectRequestDetailsLoading = (state) =>
  state.inbox.requestDetailsLoading;
export const selectRequestDetailsError = (state) =>
  state.inbox.requestDetailsError;
export const selectInboxPage = (state) => state.inbox.page;
export const selectInboxPageSize = (state) => state.inbox.pageSize;
export const selectInboxTotalCount = (state) => state.inbox.totalCount;
export const selectInboxFilters = (state) => state.inbox.filters;
export const selectLastUpdatedInbox = (state) => state.inbox.lastUpdated;
