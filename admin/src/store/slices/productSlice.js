import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const listProducts = createAsyncThunk('products/list', async (params) => {
  const res = await api.get('/api/products', { params });
  return res.data;
});

export const createProduct = createAsyncThunk('products/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/products', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Create failed');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/products/${id}`, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Delete failed');
  }
});

export const getProductBySlug = createAsyncThunk('products/getBySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/products/${slug}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Fetch failed');
  }
});

const slice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
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
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(listProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(listProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(createProduct.pending, (s) => { s.createLoading = true; s.error = null; })
      .addCase(createProduct.fulfilled, (s, a) => {
        s.createLoading = false;
        s.items.unshift(a.payload);
        s.error = null;
      })
      .addCase(createProduct.rejected, (s, a) => {
        s.createLoading = false;
        s.error = a.payload;
      })

      .addCase(updateProduct.pending, (s) => { s.updateLoading = true; s.error = null; })
      .addCase(updateProduct.fulfilled, (s, a) => {
        s.updateLoading = false;
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
        s.error = null;
      })
      .addCase(updateProduct.rejected, (s, a) => {
        s.updateLoading = false;
        s.error = a.payload;
      })

      .addCase(deleteProduct.pending, (s) => { s.deleteLoading = true; s.error = null; })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.deleteLoading = false;
        s.items = s.items.filter(item => item._id !== a.payload);
        s.error = null;
      })
      .addCase(deleteProduct.rejected, (s, a) => {
        s.deleteLoading = false;
        s.error = a.payload;
      })

      .addCase(getProductBySlug.fulfilled, (s, a) => {
        s.currentProduct = a.payload;
      });
  }
});

export const { clearError, setCurrentProduct, clearCurrentProduct } = slice.actions;
export default slice.reducer;


