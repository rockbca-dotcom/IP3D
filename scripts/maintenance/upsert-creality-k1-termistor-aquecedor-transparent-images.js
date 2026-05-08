import {  PrismaClient  } from "../node_modules/.prisma/client";

const prisma = new PrismaClient();

const slug = "termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w";

const image = "/uploads/products/termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w-1-transparent.png";
const gallery = [
  "/uploads/products/termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w-1-transparent.png",
  "/uploads/products/termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w-2-transparent.png",
  "/uploads/products/termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w-3-transparent.png",
  "/uploads/products/termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w-4-transparent.png",
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
