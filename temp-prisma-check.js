import {  PrismaClient  } from "./node_modules/.prisma/client";
const prisma = new PrismaClient();

prisma.$disconnect()
  .then(() => console.log('ok'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
