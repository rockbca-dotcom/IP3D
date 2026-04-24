const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1";

const productData = {
  name: "1x Escova De Silicone Limpeza De Bico Bambu Lab A1",
  slug,
  shortDescription:
    "Escova de silicone para limpeza de bico compatível com Bambu Lab A1, X1 e P1, ideal para limpeza automática do nozzle.",
  description:
    "<p>A <strong>1x Escova De Silicone Limpeza De Bico Bambu Lab A1</strong> é a peça ideal para manter o nozzle da sua impressora sempre limpo e pronto para iniciar a impressão com qualidade.</p><p>Produzida em <strong>silicone premium resistente a altas temperaturas</strong>, ela foi desenvolvida para a função de <strong>nozzle wiping</strong>, promovendo a limpeza automática do bico sem causar danos ao conjunto.</p><p>Com <strong>encaixe rápido</strong> e formato padrão original, essa escova é compatível com impressoras <strong>Bambu Lab A1, X1 e P1</strong>, sendo uma excelente opção para reposição imediata e manutenção preventiva.</p>",
  features: [
    "Compatível com Bambu Lab A1, X1 e P1",
    "Escova de silicone para limpeza de bico",
    "Auxilia na limpeza automática do nozzle",
    "Silicone premium resistente a altas temperaturas",
    "Encaixe rápido e direto",
    "Ideal para reposição e manutenção preventiva",
  ],
  image: "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-1-transparent.png",
  gallery: [
    "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-1-transparent.png",
    "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-2-transparent.png",
    "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-3-transparent.png",
    "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-4-transparent.png",
    "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-5-transparent.png",
  ],
  warranty: "7 dias",
  sku: "BAMBU-A1-ESCOVA-SILICONE-BICO-1X",
  priceOriginal: "19.99",
  pricePromo: "19.99",
  pixPrice: "19.99",
  installments: 4,
  installmentValue: "5.00",
  stockQuantity: 25,
  featured: true,
  active: true,
  metaTitle: "1x Escova De Silicone Limpeza De Bico Bambu Lab A1",
  metaDescription:
    "Escova de silicone para limpeza de bico compatível com Bambu Lab A1, X1 e P1, com encaixe rápido e alta resistência térmica.",
  metaKeywords:
    "escova silicone nozzle, limpeza de bico bambu lab, bambu lab a1, bambu lab x1, bambu lab p1, nozzle wiping, impressão 3d",
  ogImage: "/uploads/products/1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1-1-transparent.png",
  categoryId,
  height: 4,
  length: 4,
  weight: "0.020",
  width: 1,
};

const desiredSpecs = [
  ["Marca", "Bambu Lab"],
  ["Tipo de escova", "Escova de silicone para limpeza de bico"],
  ["Modelo", "A1, X1, P1"],
  ["Cor", "Cinza"],
  ["Formato de venda", "Unidade"],
  ["Material da cabeça", "Silicone"],
  ["Material das cerdas", "Silicone"],
  ["Altura total", "3,7 cm"],
  ["Largura", "8 mm"],
  ["Inclui cabo", "Não"],
  ["Quantidade de escovas", "1"],
  ["Compatibilidade", "Bambu Lab A1, X1 e P1"],
  ["Função", "Limpeza automática do bico (nozzle wiping)"],
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
