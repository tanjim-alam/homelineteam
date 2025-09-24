import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const listCategories = createAsyncThunk('categories/list', async () => {
  const res = await api.get('/api/categories');
  return res.data;
});

export const createCategory = createAsyncThunk('categories/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/categories', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Create failed');
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/categories/${id}`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/api/categories/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

export const getCategoryBySlug = createAsyncThunk('categories/getBySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/categories/${slug}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Fetch failed');
  }
});

export const addCustomField = createAsyncThunk('categories/addCustomField', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/categories/${id}/fields`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Add custom field failed');
  }
});

export const addVariantField = createAsyncThunk('categories/addVariantField', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/categories/${id}/variant-fields`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Add variant field failed');
  }
});

const slice = createSlice({
  name: 'categories',
  initialState: {
    items: [],
    currentCategory: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listCategories.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(listCategories.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(listCategories.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(createCategory.pending, (s) => { s.createLoading = true; s.error = null; })
      .addCase(createCategory.fulfilled, (s, a) => {
        s.createLoading = false;
        s.items.unshift(a.payload);
        s.error = null;
      })
      .addCase(createCategory.rejected, (s, a) => {
        s.createLoading = false;
        s.error = a.payload;
      })

      .addCase(updateCategory.pending, (s) => { s.updateLoading = true; s.error = null; })
      .addCase(updateCategory.fulfilled, (s, a) => {
        s.updateLoading = false;
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
        s.error = null;
      })
      .addCase(updateCategory.rejected, (s, a) => {
        s.updateLoading = false;
        s.error = a.payload;
      })

      .addCase(deleteCategory.pending, (s) => { s.deleteLoading = true; s.error = null; })
      .addCase(deleteCategory.fulfilled, (s, a) => {
        s.deleteLoading = false;
        // Remove the deleted category from the items array
        s.items = s.items.filter(item => item._id !== a.payload._id);
        // Clear current category if it was the deleted category
        if (s.currentCategory && s.currentCategory._id === a.payload._id) {
          s.currentCategory = null;
        }
        s.error = null;
      })
      .addCase(deleteCategory.rejected, (s, a) => {
        s.deleteLoading = false;
        s.error = a.payload;
      })

      .addCase(getCategoryBySlug.fulfilled, (s, a) => {
        s.currentCategory = a.payload;
      })

      .addCase(addCustomField.fulfilled, (s, a) => {
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
      })
      .addCase(addVariantField.fulfilled, (s, a) => {
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
      });
  }
});

export const { clearError, setCurrentCategory, clearCurrentCategory } = slice.actions;
export default slice.reducer;


