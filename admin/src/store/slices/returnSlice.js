import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const listReturns = createAsyncThunk('returns/list', async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const res = await api.get(`/returns/admin/products?${queryParams.toString()}`);
    return res.data;
});

export const getReturnById = createAsyncThunk('returns/getById', async (id, { rejectWithValue }) => {
    try {
        const res = await api.get(`/returns/admin/${id}`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
});

export const updateReturnStatus = createAsyncThunk('returns/updateStatus', async ({ id, status, adminNotes, refundMethod, trackingNumber }, { rejectWithValue }) => {
    try {
        const res = await api.put(`/returns/admin/${id}/status`, {
            status,
            adminNotes,
            refundMethod,
            trackingNumber
        });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
});

export const processRefund = createAsyncThunk('returns/processRefund', async ({ id, transactionId, method }, { rejectWithValue }) => {
    try {
        const res = await api.put(`/returns/admin/${id}/process-refund`, {
            transactionId,
            method
        });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Refund processing failed');
    }
});

export const completeRefund = createAsyncThunk('returns/completeRefund', async (id, { rejectWithValue }) => {
    try {
        const res = await api.put(`/returns/admin/${id}/complete-refund`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Refund completion failed');
    }
});

export const getReturnStats = createAsyncThunk('returns/getStats', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/returns/admin/stats');
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Stats fetch failed');
    }
});

const slice = createSlice({
    name: 'returns',
    initialState: {
        items: [],
        currentReturn: null,
        stats: null,
        loading: false,
        error: null,
        updateLoading: false,
        pagination: {
            current: 1,
            pages: 1,
            total: 0
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentReturn: (state, action) => {
            state.currentReturn = action.payload;
        },
        clearCurrentReturn: (state) => {
            state.currentReturn = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(listReturns.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(listReturns.fulfilled, (s, a) => {
                s.loading = false;
                s.items = a.payload.data;
                s.pagination = a.payload.pagination;
                if (a.payload.stats) {
                    s.stats = a.payload.stats;
                }
            })
            .addCase(listReturns.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

            .addCase(getReturnById.fulfilled, (s, a) => {
                s.currentReturn = a.payload.data;
            })

            .addCase(updateReturnStatus.pending, (s) => { s.updateLoading = true; s.error = null; })
            .addCase(updateReturnStatus.fulfilled, (s, a) => {
                s.updateLoading = false;
                const index = s.items.findIndex(item => item._id === a.payload.data._id);
                if (index !== -1) {
                    s.items[index] = a.payload.data;
                }
                if (s.currentReturn && s.currentReturn._id === a.payload.data._id) {
                    s.currentReturn = a.payload.data;
                }
                s.error = null;
            })
            .addCase(updateReturnStatus.rejected, (s, a) => {
                s.updateLoading = false;
                s.error = a.payload;
            })

            .addCase(processRefund.pending, (s) => { s.updateLoading = true; s.error = null; })
            .addCase(processRefund.fulfilled, (s, a) => {
                s.updateLoading = false;
                const index = s.items.findIndex(item => item._id === a.payload.data._id);
                if (index !== -1) {
                    s.items[index] = a.payload.data;
                }
                if (s.currentReturn && s.currentReturn._id === a.payload.data._id) {
                    s.currentReturn = a.payload.data;
                }
                s.error = null;
            })
            .addCase(processRefund.rejected, (s, a) => {
                s.updateLoading = false;
                s.error = a.payload;
            })

            .addCase(completeRefund.pending, (s) => { s.updateLoading = true; s.error = null; })
            .addCase(completeRefund.fulfilled, (s, a) => {
                s.updateLoading = false;
                const index = s.items.findIndex(item => item._id === a.payload.data._id);
                if (index !== -1) {
                    s.items[index] = a.payload.data;
                }
                if (s.currentReturn && s.currentReturn._id === a.payload.data._id) {
                    s.currentReturn = a.payload.data;
                }
                s.error = null;
            })
            .addCase(completeRefund.rejected, (s, a) => {
                s.updateLoading = false;
                s.error = a.payload;
            })

            .addCase(getReturnStats.fulfilled, (s, a) => {
                s.stats = a.payload.data;
            });
    }
});

export const { clearError, setCurrentReturn, clearCurrentReturn } = slice.actions;
export default slice.reducer;
