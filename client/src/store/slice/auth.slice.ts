import { api } from '@/services/api';
import { User } from '@/types/types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// interface AuthState {
//     user: User | null;
//     isAuthenticated: boolean;
//     loading: 'idle' | 'pending' | 'succeeded' | 'failed';
//     error: string | null;
// }

// const initialState: AuthState = {
//     user: null,
//     isAuthenticated: false,
//     loading: 'idle',
//     error: null,
// };

interface AuthState {
    user: User | null;
    loading: boolean; // This will now handle the initial auth check
    error: string | null;
}

// *** THE FIX: Initialize loading to true ***
// This tells the app to wait for the initial user check to complete.
const initialState: AuthState = {
    user: null,
    loading: true,
    error: null,
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data.user as User;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: any, { rejectWithValue }) => {
        try {
            // The cookie will be set automatically by the server on successful registration
            const response = await api.post('/auth/register', userData);
            return response.data.user as User;
        } catch (error: any) {
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map((e: any) => e.message).join(', ')
                : error.response?.data?.message || 'Failed to create account';
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/profile/me');
            return response.data.user as User;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/users/logout');
            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserOnlineStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
            if (state.user && state.user.id === action.payload.userId) {
                state.user.isOnline = action.payload.isOnline;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                // state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                // state.isAuthenticated = true;
                state.loading = false
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                // state.isAuthenticated = false;
                state.loading = false;
                state.user = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
                // state.isAuthenticated = false;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.user = null;
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUserOnlineStatus } = authSlice.actions;
export default authSlice.reducer;