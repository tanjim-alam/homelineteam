import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const listOrders = createAsyncThunk('orders/list', async () => {
  const res = await api.get('/api/orders');
  return res.data;
});

export const createOrder = createAsyncThunk('orders/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/orders', payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Create failed');
  }
});

export const getOrderById = createAsyncThunk('orders/getById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/orders/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Fetch failed');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/orders/${id}`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const updatePaymentStatus = createAsyncThunk('orders/updatePaymentStatus', async ({ id, paymentStatus, notes }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/api/orders/${id}/payment-status`, { paymentStatus, notes });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Payment status update failed');
  }
});

const slice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    loading: false,
    error: null,
    createLoading: false,
    updateLoading: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(listOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(listOrders.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(listOrders.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(createOrder.pending, (s) => { s.createLoading = true; s.error = null; })
      .addCase(createOrder.fulfilled, (s, a) => {
        s.createLoading = false;
        s.items.unshift(a.payload);
        s.error = null;
      })
      .addCase(createOrder.rejected, (s, a) => {
        s.createLoading = false;
        s.error = a.payload;
      })

      .addCase(getOrderById.fulfilled, (s, a) => {
        s.currentOrder = a.payload;
      })

      .addCase(updateOrderStatus.pending, (s) => { s.updateLoading = true; s.error = null; })
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        s.updateLoading = false;
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
        if (s.currentOrder && s.currentOrder._id === a.payload._id) {
          s.currentOrder = a.payload;
        }
        s.error = null;
      })
      .addCase(updateOrderStatus.rejected, (s, a) => {
        s.updateLoading = false;
        s.error = a.payload;
      })

      .addCase(updatePaymentStatus.pending, (s) => { s.updateLoading = true; s.error = null; })
      .addCase(updatePaymentStatus.fulfilled, (s, a) => {
        s.updateLoading = false;
        const index = s.items.findIndex(item => item._id === a.payload._id);
        if (index !== -1) {
          s.items[index] = a.payload;
        }
        if (s.currentOrder && s.currentOrder._id === a.payload._id) {
          s.currentOrder = a.payload;
        }
        s.error = null;
      })
      .addCase(updatePaymentStatus.rejected, (s, a) => {
        s.updateLoading = false;
        s.error = a.payload;
      });
  }
});

export const { clearError, setCurrentOrder, clearCurrentOrder } = slice.actions;
export default slice.reducer;


