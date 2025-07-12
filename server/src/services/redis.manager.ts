import { Redis } from 'ioredis';

class RedisManager {
    private static instance: RedisManager;
    private redisClient: Redis;

    private constructor() {
        this.redisClient = new Redis('redis://127.0.0.1:6379');
        this.redisClient.on('connect', () => {
            console.log('✅ Successfully connected to Redis.');
        });
        this.redisClient.on('error', (err) => {
            console.error('❌ Could not connect to Redis.', err);
        });
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    async addUserSocket(userId: string, socketId: string): Promise<void> {
        try {
            await this.redisClient.sadd(`user:${userId}:sockets`, socketId);
        } catch (error) {
            console.error(`Error adding socket for user ${userId}:`, error);
        }
    }

    async removeUserSocket(userId: string, socketId: string): Promise<void> {
        try {
            await this.redisClient.srem(`user:${userId}:sockets`, socketId);
        } catch (error) {
            console.error(`Error removing socket for user ${userId}:`, error);
        }
    }

    async getUserSockets(userId: string): Promise<string[]> {
        try {
            return await this.redisClient.smembers(`user:${userId}:sockets`);
        } catch (error) {
            console.error(`Error getting sockets for user ${userId}:`, error);
            return [];
        }
    }

    async isUserOnline(userId: string): Promise<boolean> {
        try {
            const result = await this.redisClient.exists(`user:${userId}:sockets`);
            return result === 1;
        } catch (error) {
            console.error(`Error checking online status for user ${userId}:`, error);
            return false;
        }
    }
    
    public quit(): void {
        this.redisClient.quit();
    }
}

export const redisManager = RedisManager.getInstance();