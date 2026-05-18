const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

const productImageMap = [
  {
    slug: "kit-hotend-bambu-lab-a1",
    folder: "hotend-bambu-a1",
  },
  {
    slug: "capa-silicone-bambu-lab-a1",
    folder: "silicone-bambu-a1",
  },
  {
    slug: "nozzle-aco-bambu-lab-a1",
    folder: "nozzle-bambu-a1",
  },
  {
    slug: "nozzle-wiper-bambu-lab-a1",
    folder: "wiper-bambu-a1",
  },
  {
    slug: "kit-termistor-bambu-lab-a1",
    folder: "termistor-bambu-a1",
  },
  {
    slug: "mesa-pei-bambu-lab-h2d",
    folder: "mesa-pei-h2d",
  },
  {
    slug: "kit-aquecedor-ceramico-60w",
    folder: "aquecedor-ceramico",
  },
  {
    slug: "kit-hotend-creality-cr10",
    folder: "hotend-creality-cr10",
  },
  {
    slug: "termistor-ntc-100k-3950",
    folder: "termistor-ntc",
  },
];

async function main() {
  const options = parseSeedArgs(process.argv.slice(2));
  validateEnvironment("update-product-images.js", options);

  if (options.dryRun) {
    console.log("[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    console.log("   Mapeamento de caminhos de imagem a sincronizar:");
    productImageMap.forEach((item) => {
      console.log(`   - ${item.slug} -> public/images/products/${item.folder}`);
    });
    return;
  }

  const publicDir = path.join(__dirname, "..", "public", "images", "products");

  for (const item of productImageMap) {
    const folderPath = path.join(publicDir, item.folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`Pasta não encontrada: ${item.folder}`);
      continue;
    }

    const files = fs.readdirSync(folderPath);
    const mainImage = files.find(f => f.startsWith("main."));
    const galleryImages = files.filter(f => f.startsWith("gallery-")).sort();

    if (!mainImage) {
      console.log(`Imagem principal não encontrada para: ${item.slug}`);
      continue;
    }

    const imagePath = `/images/products/${item.folder}/${mainImage}`;
    const gallery = galleryImages.map(f => `/images/products/${item.folder}/${f}`);

    try {
      await prisma.product.update({
        where: { slug: item.slug },
        data: {
          image: imagePath,
          gallery: gallery.length > 0 ? gallery : [imagePath],
        },
      });
      console.log(`✓ Atualizado: ${item.slug}`);
    } catch (error) {
      console.log(`✗ Erro ao atualizar ${item.slug}: ${error.message}`);
    }
  }

  console.log("\nAtualização concluída!");
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { main };
