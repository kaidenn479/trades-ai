import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function createClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const dbPath = dbUrl.startsWith("file:")
    ? path.resolve(process.cwd(), dbUrl.slice(5))
    : dbUrl;
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
