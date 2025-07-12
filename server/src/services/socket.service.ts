import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { redisManager } from './redis.manager';

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
    }
    
    public initialize(): void {
        console.log('🔌 Socket server initializing...');

        this.io.on('connection', (socket: Socket) => {
            console.log(`⚡ New client connected: ${socket.id}`);

            this.handleAuthentication(socket);
            this.handlePrivateMessage(socket);
            this.handleTypingEvents(socket);
            this.handleNotification(socket);
            this.handleDisconnect(socket);
        });
    }

    private async emitToUser(recipientId: string, event: string, payload: any): Promise<void> {
        const userSockets = await redisManager.getUserSockets(recipientId);
        if (userSockets && userSockets.length > 0) {
            console.log(`📬 Emitting '${event}' to user ${recipientId} on sockets: ${userSockets.join(', ')}`);
            userSockets.forEach(socketId => {
                this.io.to(socketId).emit(event, payload);
            });
        } else {
            console.log(`📭 User ${recipientId} is offline. Could not emit '${event}'.`);
        }
    }

    private handleAuthentication(socket: Socket): void {
        socket.on('authenticate', async (userId: string) => {
            if (!userId) return;

            console.log(`🔒 Authenticating user ${userId} for socket ${socket.id}`);
            
            socket.data.userId = userId;

            const wasOffline = !(await redisManager.isUserOnline(userId));
            
            await redisManager.addUserSocket(userId, socket.id);

            if (wasOffline) {
                socket.broadcast.emit('user_online', { userId });
                console.log(`🟢 User ${userId} is now online.`);
            }
        });
    }

    private handlePrivateMessage(socket: Socket): void {
        socket.on('private_message', async (payload: PrivateMessagePayload) => {
            const senderId = socket.data.userId;
            if (!senderId) return;

            const messageData = {
                senderId,
                content: payload.content,
                timestamp: new Date(),
            };
            
            await this.emitToUser(payload.recipientId, 'receive_message', messageData);
        });
    }

    private handleTypingEvents(socket: Socket): void {
        const senderId = socket.data.userId;
        if (!senderId) return;

        socket.on('typing', async (payload: TypingPayload) => {
            await this.emitToUser(payload.recipientId, 'typing', { senderId });
        });

        socket.on('stop_typing', async (payload: TypingPayload) => {
            await this.emitToUser(payload.recipientId, 'stop_typing', { senderId });
        });
    }
    
    private handleNotification(socket: Socket): void {
        socket.on('push_notification', async (payload: NotificationPayload) => {
            await this.emitToUser(payload.recipientId, 'notification', payload);
        });
    }

    private handleDisconnect(socket: Socket): void {
        socket.on('disconnect', async () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
            const userId = socket.data.userId;

            if (userId) {
                await redisManager.removeUserSocket(userId, socket.id);
                
                const isStillOnline = await redisManager.isUserOnline(userId);

                if (!isStillOnline) {
                    console.log(`🔴 User ${userId} is now offline.`);
                    socket.broadcast.emit('user_offline', { userId });
                }
            }
        });
    }
}