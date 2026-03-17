# 1. PONDASI: Gunakan image Node.js versi LTS yang sangat ringan (Alpine Linux)
FROM node:20-alpine

# 2. LOKASI KERJA: Buat folder /app di dalam kontainer dan jadikan titik utama
WORKDIR /app

# 3. CACHING: Salin package.json dan lock file lebih dulu. 
# Ini trik DevOps agar Docker tidak perlu mengunduh ulang semua library kalau tidak ada perubahan di package.json
COPY package*.json ./

# 4. PRISMA SETUP: Salin folder prisma agar kita bisa men-generate client-nya
COPY prisma ./prisma/

# 5. INSTALASI: Unduh semua dependencies
RUN npm install

# 6. GENERATE BUKU PANDUAN DATABASE: Wajib dilakukan sebelum build TypeScript
RUN npx prisma generate

# 7. SALIN KODE UTAMA: Masukkan seluruh sisa kodemu ke dalam kontainer
COPY . .

# 8. KOMPILASI: Ubah TypeScript menjadi JavaScript murni (karena Node.js tidak bisa membaca TS secara native di production)
RUN npm run build

# 9. BUKA PINTU: Beritahu kontainer bahwa aplikasi ini berjalan di port 3456
EXPOSE 3456

# 10. EKSEKUSI: Perintah mutlak yang dijalankan saat kontainer menyala
CMD ["npm", "start"]