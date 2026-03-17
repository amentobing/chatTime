import prisma from "../lib/db.js";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import { AuthRequest } from "../middleware/auth.js";
import { Response } from "express";
import { SocketAuth } from "../middleware/socket.js";

export const sendMsg = async (socket: SocketAuth, payload: any, io: Server) => {
  try {
    if (!payload || typeof payload !== "string") return socket.emit("error", { message: "Format pesan tidak valid!" });
    if (!socket.data.conversationId) return socket.emit("error", { message: "Anda belum bergabung ke dalam ruangan percakapan." });

    const savedMsg = await prisma.message.create({
      data: {
        content: payload,
        senderId: socket.data.userId as string,
        conversationsId: socket.data.conversationId as string,
      },
      include: {
        sender: {
          select: { username: true },
        },
        conversation: {
          select: { participants: { select: { id: true } } },
        },
      },
    });

    const receiverId = savedMsg.conversation.participants.find((part) => part.id !== socket.data.userId);

    io.to(savedMsg.conversationsId).emit("receiverMsg", savedMsg);
    receiverId ? io.to(receiverId.id).emit("notification", savedMsg) : "";
  } catch (error) {
    socket.emit("error", { message: "Server gagal memproses pesan." });
  }
};

export const getMsg = async (req: AuthRequest, res: Response) => {
  const { conversationId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationsId: conversationId as string,
        AND: [{ conversation: { participants: { some: { id: req.user?.userId } } } }],
      },
      take: 50,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: { username: true, id: true },
        },
      },
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
