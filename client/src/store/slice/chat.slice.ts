import { api } from '@/services/api';
import { Chat, Conversation } from '@/types/types';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    conversations: Conversation[];
    currentMessages: Chat[];
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ChatState = {
    conversations: [],
    currentMessages: [],
    loading: 'idle',
    error: null,
};

export const fetchConversations = createAsyncThunk(
    'chat/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/chats/conversations');
            return response.data.conversations as Conversation[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/chats/${conversationId}`);
            return response.data.messages as Chat[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async (data: { recipientId: string; message: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/chats/send/${data.recipientId}`, { message: data.message });
            return response.data.chat as Chat;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);


const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Chat>) => {
            if (state.currentMessages[0]?.conversationId === action.payload.conversationId) {
                state.currentMessages.push(action.payload);
            }
        },
        clearCurrentMessages: (state) => {
            state.currentMessages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
                state.loading = 'succeeded';
                state.conversations = action.payload;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchMessages.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Chat[]>) => {
                state.loading = 'succeeded';
                state.currentMessages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { addMessage, clearCurrentMessages } = chatSlice.actions;
export default chatSlice.reducer;