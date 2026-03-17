import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";
import prisma from "../lib/db.js";

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.params.username as string) || undefined;

    if (!query) return res.status(400).json({ message: "User tidak ditemukan" });

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        id: {
          not: req.user?.userId,
        },
      },
      select: {
        id: true,
        username: true,
      },
      take: 8,
    });

    if (!users || users.length === 0) return res.status(400).json({ message: "User tidak ditemukan" });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Gagal mencari user" });
  }
};
