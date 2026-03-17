import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export interface SocketAuth extends Socket {
  data: { userId?: string; conversationId?: string };
}

export default function socketMid(socket: SocketAuth, next: (err?: ExtendedError) => void) {
  const token = socket.handshake.auth.token || socket.handshake.headers.token;

  if (!token) return next(new Error("Akses ditolak, Silahkan anda login terlebih dahulu."));

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    socket.data.userId = decode.userId;
    next();
  } catch (err) {
    console.error(err);
    return next(new Error("Akses ditolak, silahkan login kembali."));
  }
}
