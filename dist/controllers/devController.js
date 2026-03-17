import prisma from "../lib/db.js";
export const getUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: "asc",
        },
    });
    return res.status(200).json(users);
};
