import type { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Delay loading the generated Prisma client until runtime.
  // This avoids Turbopack evaluating the module too early during build.
  const { PrismaClient } = eval("require")("@prisma/client") as {
    PrismaClient: new () => PrismaClient;
  };

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
