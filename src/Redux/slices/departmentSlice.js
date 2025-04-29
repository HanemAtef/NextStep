import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://nextstep.runasp.net/api/Departments';

const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
    };
};

export const fetchDepartments = createAsyncThunk(
    'departments/fetchAll',
    async () => {
        try {
            const res = await axios.get(API_URL, { headers: getHeaders() });
            return res.data;
        } catch (error) {
            console.error('Error fetching departments:', error.response || error.message);
            throw error;
        }
    }
);

export const addDepartment = createAsyncThunk(
    'departments/add',
    async (newDepartment) => {
        try {
            const res = await axios.post(API_URL, newDepartment, { headers: getHeaders() });
            return res.data;
        } catch (error) {
            console.error('Error adding department:', error.response || error.message);
            throw error;
        }
    }
);



export const deleteDepartment = createAsyncThunk(
    'departments/delete',
    async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
            return id;
        } catch (error) {
            console.error('Error deleting department:', error.response || error.message);
            throw error;
        }
    }
);

export const fetchDepartmentById = createAsyncThunk(
    'departments/fetchById',
    async (id) => {
        try {
            const res = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
            return res.data;
        } catch (error) {
            console.error('Error fetching department by ID:', error.response || error.message);
            throw error;
        }
    }
);

const departmentSlice = createSlice({
    name: 'departments',
    initialState: {
        data: [],
        currentDepartment: null,
        error: null,
    },
    reducers: {
        clearCurrentDepartment: (state) => {
            state.currentDepartment = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                if (action.error.message === "Network Error") {
                    state.error = "حدث خطأ في الشبكة، تأكد من اتصال الإنترنت.";
                } else {
                    state.error = action.error.message;
                }
            })

            .addCase(fetchDepartmentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDepartment = action.payload;
            })
            .addCase(fetchDepartmentById.rejected, (state, action) => {
                state.loading = false;
                if (action.error.message === "Network Error") {
                    state.error = "حدث خطأ في الشبكة، تأكد من اتصال الإنترنت.";
                } else {
                    state.error = action.error.message;
                }
            })

            .addCase(addDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(addDepartment.rejected, (state, action) => {
                state.loading = false;
                if (action.error.message === "Network Error") {
                    state.error = "حدث خطأ في الشبكة، تأكد من اتصال الإنترنت.";
                } else {
                    state.error = action.error.message;
                }
            })




            .addCase(deleteDepartment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDepartment.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(dept => dept.id !== action.payload);
                if (state.currentDepartment && state.currentDepartment.id === action.payload) {
                    state.currentDepartment = null;
                }
            })
            .addCase(deleteDepartment.rejected, (state, action) => {
                state.loading = false;
                if (action.error.message === "Network Error") {
                    state.error = "حدث خطأ في الشبكة، تأكد من اتصال الإنترنت.";
                } else {
                    state.error = action.error.message;
                }
            });
    },
});

export const { clearCurrentDepartment, setError, clearError } = departmentSlice.actions;
export default departmentSlice.reducer;
