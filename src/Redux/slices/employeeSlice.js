import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://nextstep.runasp.net/api/Employees'; 


const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json',
    };
};


export const fetchUsers = createAsyncThunk(
    'emloyees/fetchAll',
    async () => {
        const res = await axios.get(API_URL, { headers: getHeaders() });
        return res.data;
    }

);

export const addUser = createAsyncThunk(
    'emloyees/add',
    async (newUser, { rejectWithValue }) => {
        try {
            const res = await axios.post(
                "https://nextstep.runasp.net/api/Auth/register/employee",
                {
                    email: newUser.email,
                    password: newUser.password,
                    userName: newUser.userName,
                    departmentID: newUser.departmentId
                },
                { headers: getHeaders() }
            );
            return res.data;
        } catch (error) {
            console.error('Error adding user:', error.response?.data);
            return rejectWithValue(error.response?.data || 'حدث خطأ أثناء إضافة المستخدم');
        }
    }
);

export const updateUser = createAsyncThunk(
    'emloyees/update',
    async ({ id, updatedUser }, { rejectWithValue }) => {
        try {
            if (!id || !updatedUser) {
                return rejectWithValue('بيانات غير مكتملة');
            }

            const requestData = {
                name: updatedUser.userName || updatedUser.name || '',
                email: updatedUser.email || '',
                password: updatedUser.password || ''
            };

            const response = await axios({
                method: 'put',
                url: `${API_URL}/${id}`,
                data: requestData,
                headers: {
                    ...getHeaders(),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 204) {
                return { id, ...requestData };
            }

            return response.data;
        } catch (error) {
            console.error('Update error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.data?.errors) {
                const errorMessages = Object.entries(error.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`);
                return rejectWithValue(errorMessages.join('\n'));
            }

            return rejectWithValue(
                error.response?.data?.title ||
                error.response?.data?.message ||
                'حدث خطأ أثناء تحديث بيانات المستخدم'
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    'emloyees/delete',
    async (id) => {
        await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
        return id;
    }
);


export const fetchUserById = createAsyncThunk(
    'emloyees/fetchById',
    async (id) => {
        const res = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
        return res.data;
    }
);

const employeeSlice = createSlice({
    name: 'emloyees',
    initialState: {
        data: [],
        currentUser: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentUser: (state) => {
            state.currentUser = null;
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
            // GET ALL USERS
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(addUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(addUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                state.currentUser = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(user => user.id !== action.payload);
                if (state.currentUser && state.currentUser.id === action.payload) {
                    state.currentUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearCurrentUser, setError, clearError } = employeeSlice.actions;
export default employeeSlice.reducer;