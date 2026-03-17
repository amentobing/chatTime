import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import zod from "zod";
import prisma from "../lib/db.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // cek valid email
    const emailSchema = zod.email();
    if (!emailSchema.safeParse(email).success) {
      return res.status(400).json({ message: "Email tidak valid" });
    }
    // cek already user
    const alreadyUser = (await prisma.user.findUnique({ where: { email } })) || (await prisma.user.findUnique({ where: { username } }));
    if (alreadyUser) return res.status(400).json({ message: "Email / Userame sudah terdaftar!" });

    // encrypt password
    const encryptedPass = await bcrypt.hash(password, 10);

    // save ke database
    const newUser = await prisma.user.create({
      data: { username, email, password: encryptedPass },
    });

    res.status(201).json({ message: "User telah didaftarkan!", userId: newUser.id });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server!" });
    console.error(err);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // cek valid email
    const emailSchema = zod.email("Email tidak valid!");
    if (!emailSchema.safeParse(email).success) {
      return res.status(400).json({ message: "Email tidak valid" });
    }

    // cari user di database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User tidak ditemukan!" });

    // cek password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: "Password salah!" });

    // buat JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
    res.json({ message: "Login berhasil!", token });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
