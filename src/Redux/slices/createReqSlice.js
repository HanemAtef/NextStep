// src/Redux/slices/createReqSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://nextstep.runasp.net/api";

// Get token from sessionStorage
const getAuthToken = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        throw new Error("No token found");
    }
    return token;
};

export const fetchApplicationTypes = createAsyncThunk(
    "createReq/fetchApplicationTypes",
    async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/ApplicationTypes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            const token = getAuthToken();
            console.log("Fetching conditions for type:", typeId);
            const response = await axios.get(`${API_URL}/ApplicationTypes/${typeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
    async (formData, { rejectWithValue }) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                return rejectWithValue("No token found");
            }

            // تحويل ApplicationTypeID إلى رقم
            const applicationTypeId = parseInt(formData.get("ApplicationTypeID"));
            if (!applicationTypeId) {
                return rejectWithValue("نوع الطلب غير صالح");
            }

            const nationalId = formData.get("StudentNaid");
            const studentName = formData.get("StudentName");

            // إنشاء FormData جديد
            const newFormData = new FormData();
            newFormData.append("ApplicationTypeID", applicationTypeId);
            newFormData.append("StudentNaid", nationalId);
            newFormData.append("StudentName", studentName);
            newFormData.append("StudentPhone", formData.get("StudentPhone"));
            newFormData.append("Attachment", formData.get("Attachment"));
            if (formData.get("Notes")) {
                newFormData.append("Notes", formData.get("Notes"));
            }

            // طباعة البيانات للتحقق
            console.log("Sending data:", {
                ApplicationTypeID: applicationTypeId,
                StudentNaid: nationalId,
                StudentName: studentName,
                StudentPhone: formData.get("StudentPhone"),
                Notes: formData.get("Notes"),
                Attachment: formData.get("Attachment")?.name
            });

            const response = await axios.post(
                `${API_URL}/Applications`,
                newFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error("Error in submitApplication:", error);

            // التعامل مع خطأ عدم تطابق الرقم القومي مع اسم الطالب
            if (error.response?.status === 409) {
                const errorData = error.response.data;
                const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message;

                // فحص نوع الخطأ من الرسالة أو كود إضافي من الخادم
                if (errorMessage?.includes("مشابه") || errorData?.errorCode === "SimilarApplicationExists") {
                    return rejectWithValue("يوجد طلب مشابه بالفعل حالته قيد التنفيذ أو مقبول. لا يمكن تقديم طلب جديد من نفس النوع.");
                } else {
                    return rejectWithValue("رقم الطالب موجود، لكن اسم المستخدم لا يطابق البيانات المسجلة لهذا الرقم");
                }
            }

            if (error.response?.data) {
                const errorData = error.response.data;
                return rejectWithValue(
                    typeof errorData === 'string' ?
                        errorData :
                        (errorData.message || "حدث خطأ أثناء تقديم الطلب")
                );
            }
            return rejectWithValue("حدث خطأ أثناء تقديم الطلب");
        }
    }
);

const initialState = {
    formData: {
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
            }
        },
        resetForm: (state) => {
            state.formData = initialState.formData;
            state.conditions = [];
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
                state.error = action.error.message || "حدث خطأ أثناء جلب أنواع الطلبات";
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
                state.error = action.error.message || "حدث خطأ أثناء جلب الشروط";
            })
            .addCase(submitApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitApplication.fulfilled, (state) => {
                state.loading = false;
                state.formData = initialState.formData;
                state.conditions = [];
            })
            .addCase(submitApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ?
                    action.payload :
                    (action.error.message || "حدث خطأ أثناء تقديم الطلب");
            });
    },
});

export const { updateField, resetForm } = createReqSlice.actions;
export default createReqSlice.reducer;