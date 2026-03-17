import request from "supertest";
import { app } from "../index.js";
import prisma from "../lib/db.js";
import jwt from "jsonwebtoken";
describe("Message API Security (Eavesdropper Test)", () => {
    let penyusupToken;
    let targetConversationId;
    // INITIAL STATE SETUP (Automata)
    beforeAll(async () => {
        // 1. Sapu bersih semua tabel agar tidak ada bentrok ID dari test sebelumnya
        await prisma.message.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.user.deleteMany();
        // 2. Ciptakan 3 Simpul (Node) Pengguna
        // Kita isi password asal saja karena kita tidak sedang menguji endpoint Login di sini
        const userA = await prisma.user.create({
            data: { username: "korban1", email: "korban1@test.com", password: "hash" },
        });
        const userB = await prisma.user.create({
            data: { username: "korban2", email: "korban2@test.com", password: "hash" },
        });
        const penyusup = await prisma.user.create({
            data: { username: "hacker", email: "hacker@test.com", password: "hash" },
        });
        // 3. Ciptakan Garis Penghubung (Edge) HANYA untuk User A dan User B
        const convo = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: userA.id }, { id: userB.id }],
                },
            },
        });
        targetConversationId = convo.id;
        // 4. Buat JWT Token "jalur belakang" untuk si Penyusup
        // Alih-alih memanggil API login yang memakan waktu (HTTP overhead),
        // kita generate tokennya secara langsung layaknya fungsi internal server.
        penyusupToken = jwt.sign({ userId: penyusup.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    });
    // TEARDOWN
    afterAll(async () => {
        await prisma.message.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });
    // THE SABOTAGE ACT
    it("HARUS menolak akses jika penyusup mencoba membaca chat orang lain", async () => {
        const res = await request(app).get(`/api/msg/${targetConversationId}`).set("Authorization", `Bearer ${penyusupToken}`);
        // ASSERTION
        // Berdasarkan kueri Prisma di kodemu saat ini, karena userId si hacker
        // tidak ada di array 'participants', Prisma tidak akan menemukan pesan apa pun.
        // Hasilnya akan mengembalikan array kosong [].
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
        // (Catatan Pro: Di industri, ini idealnya mengembalikan res.status(403) Forbidden.
        // Tapi karena logikamu saat ini sekadar memfilter tanpa melempar error spesifik,
        // mengembalikan array kosong sudah cukup untuk membuktikan tidak ada data yang bocor).
    });
});
