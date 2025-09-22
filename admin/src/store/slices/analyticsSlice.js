import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

// Async thunks
export const getDashboardAnalytics = createAsyncThunk(
    'analytics/getDashboardAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/analytics/dashboard');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

export const getRouteInfo = createAsyncThunk(
    'analytics/getRouteInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/analytics/routes');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch route info');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        dashboardData: null,
        routeInfo: null,
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get dashboard analytics
            .addCase(getDashboardAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardData = action.payload.data;
                state.error = null;
            })
            .addCase(getDashboardAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get route info
            .addCase(getRouteInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRouteInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.routeInfo = action.payload.data;
                state.error = null;
            })
            .addCase(getRouteInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
