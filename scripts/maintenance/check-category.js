const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    where: { slug: { in: ["componentes-creality"] } },
  });

  console.log(JSON.stringify(categories, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
