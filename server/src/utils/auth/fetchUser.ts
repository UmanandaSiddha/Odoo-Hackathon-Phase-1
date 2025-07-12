import { prisma } from "../.."

export const fetchUser = async (userId: string) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    return existingUser;
}