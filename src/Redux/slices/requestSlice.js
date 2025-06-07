import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://nextstep.runasp.net/api/ApplicationTypes';

// ✅ تعديل هنا: التوكن يُجلب داخل الدالة
const getHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error("Token is missing");
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const fetchrequests = createAsyncThunk(
    'request/fetchAll',
    async () => {
        try {
            const res = await axios.get(API_URL, { headers: getHeaders() });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
);

export const addrequest = createAsyncThunk(
    'request/add',
    async (newrequest) => {
        try {
            console.log("Adding request:", JSON.stringify(newrequest, null, 2));
            const res = await axios.post(API_URL, newrequest, {
                headers: getHeaders()
            });
            console.log("Add request response:", res.data);
            return res.data;
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }
);

export const updaterequest = createAsyncThunk(
    'request/update',
    async (updatedrequest) => {
        try {
            console.log("Updating request:", JSON.stringify(updatedrequest, null, 2));
            const res = await axios.put(API_URL, updatedrequest, {
                headers: getHeaders()
            });
            console.log("Update request response:", res.data);
            return res.data;
        } catch (error) {
            console.error('API Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }
);

export const deleterequest = createAsyncThunk(
    'request/delete',
    async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
            return id;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
);

export const fetchrequestById = createAsyncThunk(
    'request/fetchById',
    async (id) => {
        try {
            const res = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
);

const requestSlice = createSlice({
    name: 'request',
    initialState: {
        data: [],
        currentrequest: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentrequest: (state) => {
            state.currentrequest = null;
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
            .addCase(fetchrequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchrequests.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchrequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(fetchrequestById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchrequestById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentrequest = action.payload;
            })
            .addCase(fetchrequestById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(addrequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addrequest.fulfilled, (state, action) => {
                state.loading = false;
                state.data.push(action.payload);
            })
            .addCase(addrequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(updaterequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updaterequest.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex(request => request.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
                state.currentrequest = action.payload;
            })
            .addCase(updaterequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            .addCase(deleterequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleterequest.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(request => request.id !== action.payload);
                if (state.currentrequest && state.currentrequest.id === action.payload) {
                    state.currentrequest = null;
                }
            })
            .addCase(deleterequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearCurrentrequest, setError, clearError } = requestSlice.actions;
export default requestSlice.reducer;
