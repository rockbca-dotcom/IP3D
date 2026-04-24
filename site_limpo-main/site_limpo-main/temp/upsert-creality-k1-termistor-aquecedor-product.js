const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w";

const productData = {
  name: "Termistor E Aquecedor Para Creality K1 K1C K1 Max - 24V 60W",
  slug,
  shortDescription:
    "Kit de reposição com termistor e aquecedor 24V 60W, compatível com Creality K1, K1C e K1 Max para manutenção do hotend.",
  description:
    "<p>O <strong>Termistor E Aquecedor Para Creality K1 K1C K1 Max - 24V 60W</strong> é um kit de reposição ideal para manutenção preventiva ou substituição do conjunto de aquecimento em impressoras 3D Creality.</p><p>Compatível com os modelos <strong>Creality K1, K1C e K1 Max</strong>, o kit inclui <strong>termistor e aquecedor</strong>, oferecendo leitura estável de temperatura e aquecimento eficiente para o hotend.</p><p>Produzido com <strong>cerâmica e metal</strong>, é uma solução prática para restaurar o desempenho da impressora e manter a qualidade das impressões.</p>",
  features: [
    "Compatível com Creality K1, K1C e K1 Max",
    "Kit com termistor e aquecedor 24V 60W",
    "Ideal para reposição e manutenção do hotend",
    "Temperatura máxima suportada de 360 °C",
    "Construção em cerâmica e metal",
    "Instalação prática para substituição do conjunto",
  ],
  image: "https://http2.mlstatic.com/D_NQ_NP_714974-MLB86786296809_062025-O.webp",
  gallery: [
    "https://http2.mlstatic.com/D_NQ_NP_714974-MLB86786296809_062025-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_629189-MLB82518233452_032025-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_665821-MLB82518544736_032025-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_639557-MLB82518328980_032025-O.webp",
  ],
  warranty: "Sem garantia",
  sku: "CREALITY-K1-TERMISTOR-AQUECEDOR-24V-60W",
  priceOriginal: "94.10",
  pricePromo: "59.90",
  pixPrice: "59.90",
  installments: 12,
  installmentValue: "5.90",
  stockQuantity: 25,
  featured: true,
  active: true,
  metaTitle: "Termistor E Aquecedor Para Creality K1 K1C K1 Max - 24V 60W",
  metaDescription:
    "Kit com termistor e aquecedor 24V 60W compatível com Creality K1, K1C e K1 Max, ideal para manutenção e reposição do hotend.",
  metaKeywords:
    "termistor creality k1, aquecedor creality k1, k1c, k1 max, hotend creality, reposição creality, 24v 60w",
  ogImage: "https://http2.mlstatic.com/D_NQ_NP_714974-MLB86786296809_062025-O.webp",
  categoryId,
  height: 4,
  length: 14,
  weight: "0.050",
  width: 10,
};

const desiredSpecs = [
  ["Marca", "Genérica"],
  ["Modelo", "K1 K1C K1 Max"],
  ["Formato de venda", "Kit"],
  ["Voltagem", "24V"],
  ["Potência", "60W"],
  ["Temperatura máxima suportada", "360 °C"],
  ["Material", "Cerâmica e metal"],
  ["Compatibilidade", "Creality K1 / K1C / K1 Max"],
  [
    "Usos recomendados",
    "Substituição/aplicação em termistor e aquecedor para impressoras Creality K1/K1C/K1 Max",
  ],
  ["Conteúdo da embalagem", "Termistor e aquecedor"],
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
