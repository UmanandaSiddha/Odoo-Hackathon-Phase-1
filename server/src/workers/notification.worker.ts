import { Worker } from "bullmq";
import { prisma } from "..";
import { getIO } from "../services/socket.service";
import { redisConnection } from "../services/redis.manager";

new Worker("notifications", async (job) => {
    const { receiverId, message } = job.data;
    const notification = await prisma.notification.create({
        data: {
            userId: receiverId,
            isRead: false,
            content: message,
            metadata: {}
        }
    });

    const io = getIO();
    io.to(receiverId).emit("notification", notification);
}, { connection: redisConnection });