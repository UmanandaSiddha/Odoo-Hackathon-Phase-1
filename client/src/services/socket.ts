import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './api';

class ChatSocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private statusUpdateHandlers: ((data: { messageId: string; status: string }) => void)[] = [];

  connect(userId: string) {
    if (this.socket) return;

    this.socket = io(import.meta.env.VITE_API_URL, {
      auth: {
        userId
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('receive_message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('message_status_update', (data: { messageId: string; status: string }) => {
      this.statusUpdateHandlers.forEach(handler => handler(data));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onStatusUpdate(handler: (data: { messageId: string; status: string }) => void) {
    this.statusUpdateHandlers.push(handler);
    return () => {
      this.statusUpdateHandlers = this.statusUpdateHandlers.filter(h => h !== handler);
    };
  }
}

export const chatSocket = new ChatSocketService(); 