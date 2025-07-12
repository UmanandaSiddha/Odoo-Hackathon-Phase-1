import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setUserOnlineStatus } from '@/store/slice/auth.slice';
import { addMessage } from '@/store/slice/chat.slice';
import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
    return useContext(SocketContext);
};

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:8000', {
                withCredentials: true,
            });

            setSocket(newSocket);

            newSocket.on('connect', () => console.log('✅ Socket connected:', newSocket.id));
            newSocket.on('connect_error', (err) => console.error('❌ Socket connection error:', err.message));

            newSocket.on('receive_message', (message) => {
                console.log('📬 New message received:', message);
                dispatch(addMessage(message));
            });
            
            newSocket.on('user_online', ({ userId }) => dispatch(setUserOnlineStatus({ userId, isOnline: true })));
            newSocket.on('user_offline', ({ userId }) => dispatch(setUserOnlineStatus({ userId, isOnline: false })));
            
            newSocket.on('global_announcement', (payload) => alert(`📢 Announcement: ${payload.title}\n\n${payload.message}`));

            return () => {
                console.log('🔌 Disconnecting socket...');
                newSocket.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [isAuthenticated, dispatch]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};