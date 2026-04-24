const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm";

const productData = {
  name: "Base/Mesa Magnética PEI Para Bambu Lab H2D H2S - 355x346mm",
  slug,
  shortDescription:
    "Chapa PEI texturizada dupla face 355x346mm para Bambu Lab H2D e H2S, com reconhecimento automático por QR Code.",
  description:
    "<p>A <strong>Base/Mesa Magnética PEI Para Bambu Lab H2D H2S - 355x346mm</strong> foi desenvolvida para uso com os modelos <strong>Bambu Lab H2D e H2S</strong>, oferecendo aderência estável e remoção prática das peças impressas.</p><p>Conta com <strong>dupla face</strong>, acabamento em <strong>PEI texturizado</strong> e estrutura em <strong>aço mola premium</strong>, ideal para uso profissional e repetitivo.</p><p>Seu <strong>QR Code de identificação</strong> permite reconhecimento automático pela impressora, contribuindo para configuração correta e calibração do sistema Lidar.</p><p>A base magnética é compatível com a plataforma original da série H e entrega maior durabilidade no fluxo de impressão.</p>",
  features: [
    "Compatível com Bambu Lab H2D e H2S",
    "Chapa dupla face com PEI texturizado",
    "Reconhecimento automático por QR Code",
    "Fabricada em aço mola de alta resistência",
    "Dimensões de 355 x 346 mm",
    "Remoção facilitada de peças grandes",
  ],
  image: "https://http2.mlstatic.com/D_NQ_NP_736774-MLB109923436021_042026-O.webp",
  gallery: [
    "https://http2.mlstatic.com/D_NQ_NP_736774-MLB109923436021_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_679520-MLB109419316078_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_608125-MLB109925375353_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_935604-MLB109085442212_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_885345-MLB109923376003_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_969624-MLB109922481631_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_859401-MLB109923106963_042026-O.webp",
  ],
  warranty: "Garantia do vendedor: 7 dias",
  sku: "BAMBU-H2D-H2S-BASE-MAGNETICA-PEI-355X346",
  priceOriginal: "480.00",
  pricePromo: "399.00",
  pixPrice: "399.00",
  installments: 7,
  installmentValue: "57.00",
  stockQuantity: 5,
  featured: true,
  active: true,
  metaTitle: "Base/Mesa Magnética PEI Para Bambu Lab H2D H2S - 355x346mm",
  metaDescription:
    "Base magnética PEI dupla face 355x346mm para Bambu Lab H2D e H2S, com QR Code e acabamento texturizado para alta aderência.",
  metaKeywords:
    "base pei bambu lab h2d, mesa magnética h2s, chapa pei texturizada, base magnética bambu lab, 355x346mm, h2d, h2s",
  ogImage: "https://http2.mlstatic.com/D_NQ_NP_736774-MLB109923436021_042026-O.webp",
  categoryId,
  height: 2,
  length: 36,
  weight: "0.900",
  width: 35,
};

const desiredSpecs = [
  ["Marca", "Bambu Lab"],
  ["Modelo", "Bambu Lab H2D/H2S"],
  ["Dupla voltagem", "127/220V"],
  ["Comprimento", "35.5 cm"],
  ["Largura", "34.6 cm"],
  ["Dimensões", "355 mm x 346 mm"],
  ["Material", "PEI;Aço"],
  ["Tipo", "Chapa PEI texturizada dupla face"],
  ["Compatibilidade", "Bambu Lab H2D / H2S"],
  ["Reconhecimento", "QR Code para identificação automática"],
  ["Conteúdo da embalagem", "1x Chapa de Aço Mola PEI Texturizada (355x346mm)"],
];

async function main() {
  const product = await prisma.product.upsert({
    where: { slug },
    update: productData,
    create: {
      ...productData,
      specifications: {
        create: desiredSpecs.map(([label, value]) => ({ label, value })),
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      featured: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const existingSpecs = await prisma.specification.findMany({
    where: { productId: product.id },
    select: { id: true, label: true },
  });

  for (const [label, value] of desiredSpecs) {
    const found = existingSpecs.find((item) => item.label === label);

    if (found) {
      await prisma.specification.update({
        where: { id: found.id },
        data: { value },
      });
    } else {
      await prisma.specification.create({
        data: {
          productId: product.id,
          label,
          value,
        },
      });
    }
  }

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
