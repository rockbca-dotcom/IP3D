const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const slug = "base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm";

const transparentImages = [
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-1-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-2-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-3-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-4-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-5-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-6-transparent.png",
  "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-7-transparent.png",
];

async function main() {
  const updated = await prisma.product.update({
    where: { slug },
    data: {
      image: transparentImages[0],
      gallery: transparentImages,
      ogImage: transparentImages[0],
    },
    select: {
      id: true,
      slug: true,
      image: true,
      gallery: true,
      ogImage: true,
    },
  });

  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
