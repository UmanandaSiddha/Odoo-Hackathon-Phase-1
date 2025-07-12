import app from "./app";
// import express from 'express';
import { createServer } from 'http';
import { SocketServer } from './services/socket.service';
import { redisManager } from './services/redis.manager';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const prisma = new PrismaClient();

const httpServer = createServer(app);

app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy.' });
});

const socketServer = new SocketServer(httpServer);
socketServer.initialize();

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('🔌 Shutting down server...');
    httpServer.close(() => {
        redisManager.quit();
        process.exit(0);
    });
});
