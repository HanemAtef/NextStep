// applicationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  formData: {
    name: '',
    id: '',
    department: '',
    email: '',
    avatar: ''
  },
  errors: {}  
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },
    resetForm: (state) => {
      state.formData = { name: '', id: '', department: '', email: '', avatar: '' };
    },
    setErrors: (state, action) => {
      state.errors = action.payload;  
    }
  }
});

export const { updateField, resetForm, setErrors } = applicationSlice.actions;
export default applicationSlice.reducer;
