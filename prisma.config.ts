import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // Di sini kita pindahkan url-nya
    url: process.env.DATABASE_URL,
  },
});
