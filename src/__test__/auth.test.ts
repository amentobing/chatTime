import request from "supertest";
import { app } from "../index.js"; // Kita harus mengekspor 'app' dari index.ts
import prisma from "../lib/db.js";

describe("Authentication API Endpoints", () => {
  // 1. Arrange Global: Bersihkan tabel User sebelum testing dimulai agar data selalu segar
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  // Teardown: Bersihkan lagi dan putuskan koneksi Prisma setelah semua test selesai
  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // Mock data untuk pengujian
  const testUser = {
    username: "qatester123",
    email: "qa@example.com",
    password: "passwordSuperAman123!",
  };

  describe("POST /api/auth/register", () => {
    it("HARUS berhasil mendaftarkan user baru (Status 201)", async () => {
      // 2. Act: Tembak endpoint dengan payload mock data
      const res = await request(app).post("/api/auth/register").send(testUser);

      // 3. Assert: Pastikan ekspektasi sesuai dengan respons server
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "User telah didaftarkan!");
      expect(res.body).toHaveProperty("userId");
    });

    it("HARUS gagal jika email/username sudah terdaftar (Status 400)", async () => {
      // Act: Tembak lagi dengan data yang sama persis
      const res = await request(app).post("/api/auth/register").send(testUser);

      // Assert: Harus ditolak oleh validasi database-mu
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email / Userame sudah terdaftar!");
    });
  });

  describe("POST /api/auth/login", () => {
    it("HARUS berhasil login dengan kredensial yang benar dan mengembalikan JWT (Status 200)", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token"); // Memastikan JWT token ter-generate
      expect(res.body.message).toBe("Login berhasil!");
    });

    it("HARUS menolak login jika password salah (Status 400)", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "passwordYangSalah",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password salah!");
    });
  });
});
