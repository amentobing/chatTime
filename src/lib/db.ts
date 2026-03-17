import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/client.js";
import { Pool } from "pg";

const cs = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: cs });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
