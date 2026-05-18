import {  PrismaClient  } from "../node_modules/.prisma/client";

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini";

const productData = {
  name: "2x Capa De Silicone Para Hotend Bambu Lab A1 E A1 Mini",
  slug,
  shortDescription:
    "Kit com 2 capas de silicone para hotend Bambu Lab A1 e A1 Mini, com proteção térmica eficiente e encaixe preciso.",
  description:
    "<p>A <strong>2x Capa De Silicone Para Hotend Bambu Lab A1 E A1 Mini</strong> é uma solução prática para quem busca mais estabilidade térmica e proteção durante a impressão 3D.</p><p>Desenvolvido para os modelos <strong>Bambu Lab A1</strong> e <strong>A1 Mini</strong>, o kit inclui <strong>duas capas de silicone</strong> com encaixe preciso, ajudando a manter o calor no bloco aquecido e reduzindo o acúmulo de resíduos no conjunto do hotend.</p><p>Com suporte para operação em até <strong>300 °C</strong>, esse acessório contribui para maior eficiência térmica, melhora da consistência de impressão e aumento da durabilidade do hotend no uso contínuo.</p>",
  features: [
    "Kit com 2 capas de silicone para hotend",
    "Compatível com Bambu Lab A1 e A1 Mini",
    "Ajuda a manter a estabilidade térmica do conjunto",
    "Protege o hotend contra resíduos e desgaste",
    "Suporta operação em até 300 °C",
    "Instalação simples e encaixe preciso",
  ],
  image: "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-1-transparent.png",
  gallery: [
    "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-1-transparent.png",
    "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-2-transparent.png",
    "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-3-transparent.png",
    "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-4-transparent.png",
    "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-5-transparent.png",
  ],
  warranty: "7 dias",
  sku: "BAMBU-A1-A1MINI-CAPA-SILICONE-2X",
  priceOriginal: "39.99",
  pricePromo: "39.99",
  pixPrice: "39.99",
  installments: 4,
  installmentValue: "10.00",
  stockQuantity: 10,
  featured: true,
  active: true,
  metaTitle: "2x Capa De Silicone Para Hotend Bambu Lab A1 E A1 Mini",
  metaDescription:
    "Kit com 2 capas de silicone para hotend Bambu Lab A1 e A1 Mini, com proteção térmica, encaixe preciso e suporte para até 300 °C.",
  metaKeywords:
    "capa silicone hotend, bambu lab a1, bambu lab a1 mini, hotend a1 mini, proteção térmica hotend, impressão 3d",
  ogImage: "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-1-transparent.png",
  categoryId,
  height: 2,
  length: 16,
  weight: "0.050",
  width: 11,
};

const desiredSpecs = [
  ["Marca", "Bambu Lab"],
  ["Modelo", "A1 e A1 Mini"],
  ["Tipo", "Capa de silicone para hotend"],
  ["Quantidade de peças", "2"],
  ["Compatibilidade", "Bambu Lab A1 e A1 Mini"],
  ["Tensão de operação", "24V"],
  ["Temperatura máxima de operação", "300 °C"],
  ["Diâmetro do bico", "0,4 mm"],
  ["Diâmetro do filamento", "1,75 mm"],
  ["Inclui cabo", "Não"],
  ["Kit de fábrica", "Sim"],
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
