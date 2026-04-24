const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const slug = "fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas";

const image = "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-1-transparent.png";
const gallery = [
  "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-1-transparent.png",
  "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-2-transparent.png",
  "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-3-transparent.png",
  "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-4-transparent.png",
  "/uploads/products/fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas-5-transparent.png",
];

async function main() {
  const product = await prisma.product.update({
    where: { slug },
    data: {
      image,
      gallery,
      ogImage: image,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      gallery: true,
      ogImage: true,
    },
  });

  console.log(JSON.stringify(product, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
