import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global caching in development to avoid multiple instances during hot reload.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
