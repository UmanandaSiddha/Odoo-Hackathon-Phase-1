import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import { fetchUser } from "../utils/auth/fetchUser";
import { prisma } from "..";

interface IAvailabilityProps {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
}

interface ISkillsProps {
    name: string;
    description?: string;
}

interface IAddressProps {
    address: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
}

export const onboarding = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) return sendResponse(res, 404, false, "User ID is absent");

        const existingUser = await fetchUser(userId);
        if (!existingUser) return sendResponse(res, 404, false, "User not found");

        const {
            bio,
            location,
            skills,
            availability,
        }: {
            bio: string;
            location: IAddressProps;
            skills: ISkillsProps[];
            availability: IAvailabilityProps;
        } = req.body;
        if (!bio || !location || skills.length === 0 || !availability)
            return sendResponse(res, 400, false, "Missing data in request body");

        const onboardedData = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                bio: bio,
                location: {
                    create: location,
                },
                skillsOffered: {
                    create: skills.map((skill) => ({
                        name: skill.name,
                        description: skill.description ?? "",
                    })),
                },
                availability: {
                    create: availability
                }
            },
            include: {
                location: true,
                skillsOffered: true,
                availability: true,
            },
        });

        return sendResponse(res, 200, true, "User onboarded successfully", {
            onboardedUser: onboardedData,
        });
    } catch (error) {
        console.error("Error while performing onboarding: ", error);
        return sendResponse(res, 500, false, "Internal Server Error");
    }
};