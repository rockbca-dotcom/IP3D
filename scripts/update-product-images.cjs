// scripts/update-product-images.cjs
// Run: node scripts/update-product-images.cjs
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('./.prisma/client');

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'products');

// Mapping: slug -> image filename (already downloaded)
const productImageMap = [
  { slug: 'capa-silicone-bambu-lab-a1', image: '/uploads/products/capa-silicone-bambu-lab-a1.jpg' },
  { slug: 'bico-nozzle-aco-endurecido-bambu-lab-a1', image: '/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg' },
  { slug: 'limpador-bico-bambu-lab-a1', image: '/uploads/products/limpador-bico-bambu-lab-a1.jpg' },
  { slug: 'mesa-pei-texturizada-bambu-lab-h2d', image: '/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg' },
  { slug: 'kit-aquecedor-ceramico-60w', image: '/uploads/products/kit-aquecedor-ceramico-60w.jpg' },
  { slug: 'kit-hotend-creality-cr-10', image: '/uploads/products/kit-hotend-creality-cr-10.jpg' },
];

async function main() {
  console.log('Checking downloaded images...');
  const files = fs.readdirSync(UPLOADS_DIR);
  console.log('Files in uploads/products:', files.join(', '));

  console.log('\nUpdating product images in database...');

  for (const item of productImageMap) {
    const filename = path.basename(item.image);
    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`SKIP (file not found): ${filename}`);
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size < 5000) {
      console.log(`SKIP (file too small - ${stat.size} bytes): ${filename}`);
      continue;
    }

    try {
      const product = await prisma.product.findFirst({
        where: { slug: { contains: item.slug.split('-').slice(0, 4).join('-'), mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, image: true },
      });

      if (!product) {
        // Try with exact slug
        const exactProduct = await prisma.product.findUnique({
          where: { slug: item.slug },
          select: { id: true, name: true, slug: true, image: true },
        });

        if (!exactProduct) {
          console.log(`NOT FOUND in DB: ${item.slug}`);
          continue;
        }

        await prisma.product.update({
          where: { id: exactProduct.id },
          data: { image: item.image },
        });
        console.log(`UPDATED: "${exactProduct.name}" -> ${item.image}`);
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: { image: item.image },
      });
      console.log(`UPDATED: "${product.name}" -> ${item.image}`);
    } catch (err) {
      console.error(`ERROR updating ${item.slug}:`, err.message);
    }
  }

  // List all products for verification
  console.log('\nAll products with current images:');
  const all = await prisma.product.findMany({
    select: { name: true, slug: true, image: true },
    orderBy: { createdAt: 'asc' },
  });
  all.forEach(p => {
    const hasImage = p.image && !p.image.includes('placeholder');
    console.log(`${hasImage ? '✓' : '○'} ${p.slug} -> ${p.image || 'no image'}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
