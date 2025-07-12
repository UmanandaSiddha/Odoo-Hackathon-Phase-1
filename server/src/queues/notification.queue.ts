import { Queue } from 'bullmq';
import { redisConnection } from '../services/redis.manager';

export const notificationQueue = new Queue("notifications", {
    connection: redisConnection
});