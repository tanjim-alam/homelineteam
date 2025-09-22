import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const listUsers = createAsyncThunk('users/list', async () => {
    const res = await api.get('/api/users');
    return res.data;
});

export const getUserById = createAsyncThunk('users/getById', async (id, { rejectWithValue }) => {
    try {
        const res = await api.get(`/api/users/${id}`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, userData }, { rejectWithValue }) => {
    try {
        const res = await api.put(`/api/users/${id}`, userData);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
    try {
        const res = await api.delete(`/api/users/${id}`);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
});

export const toggleUserStatus = createAsyncThunk('users/toggleStatus', async ({ id, isActive }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/api/users/${id}/toggle-status`, { isActive });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Toggle failed');
    }
});

const slice = createSlice({
    name: 'users',
    initialState: {
        items: [],
        currentUser: null,
        loading: false,
        error: null,
        updateLoading: false,
        deleteLoading: false
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(listUsers.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(listUsers.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
            .addCase(listUsers.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

            .addCase(getUserById.fulfilled, (s, a) => {
                s.currentUser = a.payload;
            })

            .addCase(updateUser.pending, (s) => { s.updateLoading = true; s.error = null; })
            .addCase(updateUser.fulfilled, (s, a) => {
                s.updateLoading = false;
                const index = s.items.findIndex(item => item._id === a.payload._id);
                if (index !== -1) {
                    s.items[index] = a.payload;
                }
                if (s.currentUser && s.currentUser._id === a.payload._id) {
                    s.currentUser = a.payload;
                }
                s.error = null;
            })
            .addCase(updateUser.rejected, (s, a) => {
                s.updateLoading = false;
                s.error = a.payload;
            })

            .addCase(deleteUser.pending, (s) => { s.deleteLoading = true; s.error = null; })
            .addCase(deleteUser.fulfilled, (s, a) => {
                s.deleteLoading = false;
                s.items = s.items.filter(item => item._id !== a.payload._id);
                s.error = null;
            })
            .addCase(deleteUser.rejected, (s, a) => {
                s.deleteLoading = false;
                s.error = a.payload;
            })

            .addCase(toggleUserStatus.pending, (s) => { s.updateLoading = true; s.error = null; })
            .addCase(toggleUserStatus.fulfilled, (s, a) => {
                s.updateLoading = false;
                const index = s.items.findIndex(item => item._id === a.payload._id);
                if (index !== -1) {
                    s.items[index] = a.payload;
                }
                if (s.currentUser && s.currentUser._id === a.payload._id) {
                    s.currentUser = a.payload;
                }
                s.error = null;
            })
            .addCase(toggleUserStatus.rejected, (s, a) => {
                s.updateLoading = false;
                s.error = a.payload;
            });
    }
});

export const { clearError, setCurrentUser, clearCurrentUser } = slice.actions;
export default slice.reducer;


