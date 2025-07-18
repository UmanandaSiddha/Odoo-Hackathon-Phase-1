import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { redisManager } from './redis.manager';
import { prisma } from "../index";
import { socketAuthMiddleware, SocketWithAuth } from '../middlewares/socket.middleware';

interface PrivateMessagePayload {
    recipientId: string;
    content: string;
}

interface TypingPayload {
    recipientId: string;
}

interface NotificationPayload {
    recipientId: string;
    title: string;
    message: string;
    link?: string;
}

export class SocketServer {
    private io: Server;

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.io.use(socketAuthMiddleware);
    }

    public initialize(): void {
        console.log('🔌 Socket server initializing...');

        this.io.on('connection', (socket: SocketWithAuth) => {
            console.log(`⚡ New client connected: ${socket.id} with user: ${socket.data.user?.id}`);
            this.handleConnection(socket);
            this.handlePrivateMessage(socket);
            this.handleTypingEvents(socket);
            this.handleNotification(socket);
            this.handleAdminBroadcast(socket);
            this.handleDisconnect(socket);
        });
    }

    private async handleConnection(socket: SocketWithAuth) {
        const userId = socket.data.user?.id;
        if (!userId) return;

        console.log(`⚡ User ${userId} connected with socket ID: ${socket.id}`);
        
        const wasOffline = !(await redisManager.isUserOnline(userId));
        
        await redisManager.addUserSocket(userId, socket.id);

        if (wasOffline) {
            console.log(`🟢 User ${userId} is now online.`);
            await prisma.user.update({
                where: { id: userId },
                data: { isOnline: true },
            });
            socket.broadcast.emit('user_online', { userId });
        }
    }

    broadcastToAll(event: string, payload: any): void {
        console.log(`📢 Broadcasting event '${event}' to all clients.`);
        this.io.emit(event, payload);
    }

    async emitToUser(recipientId: string, event: string, payload: any): Promise<void> {
        const userSockets = await redisManager.getUserSockets(recipientId);
        if (userSockets && userSockets.length > 0) {
            userSockets.forEach(socketId => {
                this.io.to(socketId).emit(event, payload);
            });
        } else {
            console.log(`📭 User ${recipientId} is offline. Could not emit '${event}'.`);
        }
    }

    private handlePrivateMessage(socket: SocketWithAuth): void {
        socket.on('private_message', async (payload: PrivateMessagePayload) => {
            const senderId = socket.data.user?.id;
            if (!senderId) return;

            const messageData = {
                senderId,
                content: payload.content,
                timestamp: new Date(),
            };
            
            await this.emitToUser(payload.recipientId, 'receive_message', messageData);
        });
    }

    private handleTypingEvents(socket: SocketWithAuth): void {
        socket.on('typing', async (payload: TypingPayload) => {
            const senderId = socket.data.user?.id;
            if (!senderId) return;
            await this.emitToUser(payload.recipientId, 'typing', { senderId });
        });

        socket.on('stop_typing', async (payload: TypingPayload) => {
            const senderId = socket.data.user?.id;
            if (!senderId) return;
            await this.emitToUser(payload.recipientId, 'stop_typing', { senderId });
        });
    }
    
    private handleNotification(socket: SocketWithAuth): void {
        socket.on('push_notification', async (payload: NotificationPayload) => {
            await this.emitToUser(payload.recipientId, 'notification', payload);
        });
    }

    private handleAdminBroadcast(socket: SocketWithAuth): void {
        socket.on('admin_broadcast', (payload: { message: string; title: string }) => {
            console.log(`Admin ${socket.data.user?.id} is broadcasting a message.`);
            this.broadcastToAll('global_announcement', payload);
        });
    }

    private handleDisconnect(socket: SocketWithAuth): void {
        socket.on('disconnect', async () => {
            const userId = socket.data.user?.id;
            if (!userId) return;

            console.log(`🔌 User ${userId} disconnected socket: ${socket.id}`);

            await redisManager.removeUserSocket(userId, socket.id);
            const isStillOnline = await redisManager.isUserOnline(userId);

            if (!isStillOnline) {
                console.log(`🔴 User ${userId} is now offline.`);
                await prisma.user.update({
                    where: { id: userId },
                    data: { isOnline: false },
                });
                socket.broadcast.emit('user_offline', { userId });
            }
        });
    }
}

let socketServerInstance: SocketServer;

export const initSocketServer = (httpServer: HttpServer): SocketServer => {
  if (!socketServerInstance) {
    socketServerInstance = new SocketServer(httpServer);
    socketServerInstance.initialize();
  }
  return socketServerInstance;
};

export const getIO = (): Server => {
  if (!socketServerInstance) {
    throw new Error("Socket server not initialized.");
  }
  return socketServerInstance["io"]; // or socketServerInstance.getIO() if you prefer a getter
};
