import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://nextstep.runasp.net/api";

const formatDateForAPI = (date) => {
  if (!date) return "";

  try {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}%2F${month}%2F${day}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "";
  }
};

const getAuthToken = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  return token;
};

// إحصائيات عامة للطلبات
export const fetchStats = createAsyncThunk(
  "reportDashboard/fetchStats",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Reports/stats`;

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      }

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return rejectWithValue("حدث خطأ أثناء جلب الإحصائيات");
    }
  }
);

// قائمة الإدارات
export const fetchDepartments = createAsyncThunk(
  "reportDashboard/fetchDepartments",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Departments`;

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else {
      }

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });

      if (Array.isArray(response.data)) {
        return response.data
          .filter((dept) => {
            const deptName =
              dept.departmentName || dept.name || dept.arabic_name || "";
            return (
              !deptName.includes("إدارة التقارير") &&
              !deptName.includes("اداره التقارير")
            );
          })
          .map((dept) => ({
            ...dept,
            name:
              dept.departmentName ||
              dept.name ||
              dept.arabic_name ||
              `قسم ${dept.id}`,
          }));
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error(
        "This might be a network or authentication issue. Check the API URL and make sure you have valid credentials."
      );

      return rejectWithValue({
        message: "حدث خطأ أثناء جلب الإدارات",
        details: error.response?.data || error.message,
        statusCode: error.response?.status,
      });
    }
  }
);

// التحليل الزمني للطلبات
export const fetchTimeAnalysis = createAsyncThunk(
  "reportDashboard/fetchTimeAnalysis",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Reports/requests/time-analysis`;

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else {
      }

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });

      return response.data;
    } catch (error) {
      console.error("Error fetching time analysis:", error);
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      return rejectWithValue("حدث خطأ أثناء جلب التحليل الزمني");
    }
  }
);

// عدد الطلبات لكل إدارة
export const fetchRequestsCount = createAsyncThunk(
  "reportDashboard/fetchRequestsCount",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Reports/departments/requests-count`;

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else {
      }

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching requests count:", error);
      return rejectWithValue("حدث خطأ أثناء جلب عدد الطلبات");
    }
  }
);

// الطلبات المنشأة حسب الشهر
export const fetchCreatedRequests = createAsyncThunk(
  "reportDashboard/fetchCreatedRequests",
  async ({ startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Reports/requests/created`;

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        url += `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      } else {
      }

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching created requests:", error);
      return rejectWithValue("حدث خطأ أثناء جلب الطلبات المنشأة");
    }
  }
);

// حالات الطلبات حسب الإدارات
export const fetchDepartmentStatus = createAsyncThunk(
  "reportDashboard/fetchDepartmentStatus",
  async ({ status, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_URL}/Reports/departments/status`;
      const params = [];

      if (status) {
        let arabicStatus = status;
        if (status === "pending") arabicStatus = "قيد التنفيذ";
        else if (status === "delayed") arabicStatus = "متأخره";
        else if (status === "rejected") arabicStatus = "مرفوض";
        else if (status === "approved") arabicStatus = "مقبول";

        // console.log('Status before encoding:', arabicStatus);
        params.push(`status=${encodeURIComponent(arabicStatus)}`);
        // console.log('Final status parameter:', params[params.length - 1]);
      }

      if (startDate && endDate) {
        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);
        params.push(`startDate=${formattedStartDate}`);
        params.push(`endDate=${formattedEndDate}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      // console.log('Final API URL:', url);

      const headers = {};
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch (authError) {
        console.warn("No auth token available:", authError);
      }

      const response = await axios.get(url, { headers });
      // console.log('API Response:', response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching department status:", error);
      console.error("Error URL:", error.config?.url);
      console.error("Error Response:", error.response?.data);
      return rejectWithValue("حدث خطأ أثناء جلب حالات الطلبات حسب الإدارات");
    }
  }
);

const initialState = {
  stats: {
    totalRequests: 0,
    pendingRequests: 0,
    delayedRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  },
  departments: [],
  timeAnalysis: {
    labels: [],
    data: [],
  },
  requestsCount: {
    labels: [],
    data: [],
  },
  createdRequests: {
    labels: [],
    data: [],
  },
  departmentStatus: {
    labels: [],
    data: [],
  },
  dateRange: {
    startDate: new Date(
      new Date().setDate(new Date().getDate() - 7)
    ).toISOString(),
    endDate: new Date().toISOString(),
  },
  pieStatus: "delayed",
  loading: {
    stats: false,
    departments: false,
    timeAnalysis: false,
    requestsCount: false,
    createdRequests: false,
    departmentStatus: false,
  },
  error: {
    stats: null,
    departments: null,
    timeAnalysis: null,
    requestsCount: null,
    createdRequests: null,
    departmentStatus: null,
  },
};

const reportDashboardSlice = createSlice({
  name: "reportDashboard",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      const startDate =
        action.payload.startDate instanceof Date
          ? action.payload.startDate.toISOString()
          : action.payload.startDate;

      const endDate =
        action.payload.endDate instanceof Date
          ? action.payload.endDate.toISOString()
          : action.payload.endDate;

      state.dateRange = {
        startDate,
        endDate,
      };
    },
    setPieStatus: (state, action) => {
      state.pieStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      })

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
        state.error.departments = action.payload;
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

      // Requests Count
      .addCase(fetchRequestsCount.pending, (state) => {
        state.loading.requestsCount = true;
        state.error.requestsCount = null;
      })
      .addCase(fetchRequestsCount.fulfilled, (state, action) => {
        state.loading.requestsCount = false;
        state.requestsCount = action.payload;
      })
      .addCase(fetchRequestsCount.rejected, (state, action) => {
        state.loading.requestsCount = false;
        state.error.requestsCount = action.payload;
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
        state.error.createdRequests = action.payload;
      })

      // Department Status
      .addCase(fetchDepartmentStatus.pending, (state) => {
        state.loading.departmentStatus = true;
        state.error.departmentStatus = null;
      })
      .addCase(fetchDepartmentStatus.fulfilled, (state, action) => {
        state.loading.departmentStatus = false;
        state.departmentStatus = action.payload;
      })
      .addCase(fetchDepartmentStatus.rejected, (state, action) => {
        state.loading.departmentStatus = false;
        state.error.departmentStatus =
          action.payload || "حدث خطأ أثناء جلب حالات الطلبات حسب الإدارات";
      });
  },
});

export const { setDateRange, setPieStatus } = reportDashboardSlice.actions;

// Selectors
export const selectStats = (state) => state.reportDashboard.stats;
export const selectDepartments = (state) => state.reportDashboard.departments;
export const selectTimeAnalysis = (state) => state.reportDashboard.timeAnalysis;
export const selectRequestsCount = (state) =>
  state.reportDashboard.requestsCount;
export const selectCreatedRequests = (state) =>
  state.reportDashboard.createdRequests;
export const selectDepartmentStatus = (state) =>
  state.reportDashboard.departmentStatus;
export const selectDateRange = (state) =>
  state.reportDashboard?.dateRange || {
    startDate: new Date(
      new Date().setDate(new Date().getDate() - 7)
    ).toISOString(),
    endDate: new Date().toISOString(),
  };
export const selectPieStatus = (state) => state.reportDashboard.pieStatus;
export const selectLoading = (state) => state.reportDashboard.loading;
export const selectError = (state) => state.reportDashboard.error;

export default reportDashboardSlice.reducer;
