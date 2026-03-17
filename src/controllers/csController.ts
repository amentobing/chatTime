// Conversation Controller
import { Response } from "express";
import prisma from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";
import { Socket, Server } from "socket.io";
import { SocketAuth } from "../middleware/socket.js";

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.userId;
    const { receiverId } = req.body;

    if (!senderId || !receiverId) return res.status(400).json({ message: "Data tidak lengkap" });
    if (senderId === receiverId) return res.status(400).json({ message: "Kamu tidak bisa membuat obrolan dengan diri sendiri." });

    const alreadyConversation = await prisma.conversation.findFirst({
      where: {
        AND: [{ participants: { some: { id: senderId } } }, { participants: { some: { id: receiverId } } }],
      },
    });
    if (alreadyConversation) return res.status(200).json(alreadyConversation);

    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: senderId }, { id: receiverId }],
        },
      },
    });
    return res.status(201).json(newConversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        participants: {
          select: { id: true, username: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const joinConversation = async (socket: SocketAuth, conversationId: any) => {
  try {
    if (!conversationId || typeof conversationId !== "string") return socket.emit("error", { message: "Format ID tidak sesuai." });
    const findConversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        AND: [{ participants: { some: { id: socket.data.userId } } }],
      },
    });

    if (!findConversation) return socket.emit("error", { message: "Percakapan tidak ditemukan" });
    socket.data.conversationId = findConversation.id;
    socket.join(findConversation.id);
  } catch (error) {
    socket.emit("error", { message: "Terjadi kesalahan server." });
  }
};
