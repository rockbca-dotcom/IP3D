import {  PrismaClient  } from "../node_modules/.prisma/client";

const prisma = new PrismaClient();

const categoryId = "cmmhxuq2l0001pu6jhyv7vfzx";
const slug = "fep-film-lcd-halot-mage-pro-original-creality-5-un";

const productData = {
  name: "Fep Film LCD Para Halot Mage/Pro Original Creality - 5 Un",
  slug,
  shortDescription:
    "Kit com 5 unidades de filme FEP original Creality para Halot Mage e Halot Mage Pro, com encaixe preciso e alta durabilidade.",
  description:
    "<p>O <strong>Fep Film LCD Para Halot Mage/Pro Original Creality - 5 Un</strong> é um conjunto com 5 películas FEP originais, desenvolvido para impressoras 3D de resina <strong>Creality Halot Mage</strong> e <strong>Halot Mage Pro</strong>, além de outras bases compatíveis de 10 polegadas.</p><p>Fabricado com material de alta resistência, o filme FEP original oferece excelente transparência, estabilidade dimensional e longa vida útil, ajudando a manter a qualidade das impressões com mais definição e superfícies mais lisas.</p><p>É uma reposição essencial para quem busca <strong>compatibilidade perfeita</strong>, troca prática e segurança no processo de impressão em resina, preservando o desempenho do equipamento com uma peça original Creality.</p>",
  features: [
    "Kit com 5 unidades de filme FEP original Creality",
    "Compatível com Halot Mage e Halot Mage Pro",
    "Também atende outras cubas de 10 polegadas compatíveis",
    "Alta transparência para melhor passagem de luz UV",
    "Material resistente com boa durabilidade e estabilidade",
    "Reposição prática para manter a qualidade de impressão em resina",
  ],
  image: "https://http2.mlstatic.com/D_NQ_NP_680477-MLB77936718433_072024-O.webp",
  gallery: [
    "https://http2.mlstatic.com/D_NQ_NP_680477-MLB77936718433_072024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_642938-MLA77715712966_072024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_948217-MLB77937156579_072024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_664949-MLB79202660717_092024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_796052-MLB79178472069_092024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_713584-MLB77936459953_072024-O.webp",
  ],
  warranty: "90 dias",
  sku: "CREALITY-FEP-HALOT-MAGE-PRO-5UN",
  priceOriginal: "549.90",
  pricePromo: "481.74",
  pixPrice: "443.20",
  installments: 9,
  installmentValue: "53.53",
  stockQuantity: 5,
  featured: true,
  active: true,
  metaTitle: "Fep Film LCD Para Halot Mage/Pro Original Creality - 5 Un",
  metaDescription:
    "Kit com 5 filmes FEP originais Creality para Halot Mage e Halot Mage Pro, com alta durabilidade, encaixe preciso e excelente qualidade de impressão.",
  metaKeywords:
    "fep film creality, halot mage, halot mage pro, filme fep, impressora 3d resina, creality original",
  ogImage: "https://http2.mlstatic.com/D_NQ_NP_680477-MLB77936718433_072024-O.webp",
  categoryId,
  height: 2,
  length: 31,
  weight: "0.220",
  width: 22,
};

const desiredSpecs = [
  ["Marca", "Creality"],
  ["Modelo", "Halot Mage/Pro"],
  ["Tipo", "Filme FEP para impressão 3D em resina"],
  ["Quantidade", "5 unidades"],
  ["Compatibilidade principal", "Creality Halot Mage e Halot Mage Pro"],
  ["Compatibilidade adicional", "Outras bases compatíveis de 10 polegadas"],
  ["Fabricante", "Creality"],
  ["Original", "Sim"],
  ["Aplicação", "Reposição para cuba/reservatório de impressoras 3D de resina"],
  ["Benefício", "Melhor transparência, estabilidade e qualidade de impressão"],
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
