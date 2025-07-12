import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/auth.slice';
import chatReducer from './slice/chat.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;