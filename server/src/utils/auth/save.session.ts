import { prisma } from "../..";

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + Number("1000 * 60 * 60 * 24 * 14"));

export const saveSessionInDB = async (
	userId: string,
	accessToken: string,
	refreshToken: string
) => {
	try {
		const existingSession = await prisma.session.findFirst({
			where: {
				userId: userId
			}
		});

		if (!existingSession) {
			const sessionInDB = await prisma.session.create({
				data: {
					userId: userId,
					accessToken: accessToken,
					refreshToken: refreshToken,
					expiresAt: expiresAt
				}
			})

			console.log("session saved in the database: ", sessionInDB);
			return sessionInDB;
		}

		const updatedSesison = await prisma.session.update({
			where: {
				id: existingSession.id
			},
			data: {
				accessToken: accessToken,
				refreshToken: refreshToken,
				expiresAt: expiresAt
			}
		})

		console.log("session updated in the database: ", updatedSesison);
		return updatedSesison;
	} catch (error) {
		console.error("Error while saving session data: ", error);
		throw new Error("Error while saving session data");
	}
};
