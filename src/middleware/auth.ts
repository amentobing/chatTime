import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Akses ditolak. Token tidak ada" });
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.user = decode;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
  }
};
