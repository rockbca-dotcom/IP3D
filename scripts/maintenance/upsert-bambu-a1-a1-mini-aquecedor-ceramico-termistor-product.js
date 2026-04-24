const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "aquecedor-ceramico-e-termistor-para-bambu-lab-a1-e-a1-mini";

const productData = {
  name: "Aquecedor Cerâmico E Termistor Para Bambu Lab A1 E A1 Mini",
  slug,
  shortDescription:
    "Kit com aquecedor cerâmico e termistor para Bambu Lab A1 e A1 Mini, com conector e suporte até 300°C.",
  description:
    "<p>O <strong>Aquecedor Cerâmico E Termistor Para Bambu Lab A1 E A1 Mini</strong> é uma peça de reposição indicada para restaurar o aquecimento e o monitoramento térmico do hotend com encaixe compatível.</p><p>O conjunto acompanha <strong>aquecedor cerâmico</strong> e <strong>termistor</strong>, oferecendo instalação em unidade única para manutenção prática.</p><p>Compatível com <strong>Bambu Lab A1 e A1 Mini</strong>, suporta temperatura de trabalho de até <strong>300°C</strong> e possui <strong>conector</strong> para integração adequada ao sistema.</p>",
  features: [
    "Compatível com Bambu Lab A1 e A1 Mini",
    "Conjunto com aquecedor cerâmico e termistor",
    "Suporta até 300°C",
    "Possui conector",
    "Comprimento do cabo de 16,5 cm",
    "Ideal para reposição e manutenção",
  ],
  image: "https://http2.mlstatic.com/D_NQ_NP_838665-MLB110317609179_042026-O.webp",
  gallery: [
    "https://http2.mlstatic.com/D_NQ_NP_838665-MLB110317609179_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_743452-MLB110317579557_042026-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_600229-MLB110317906625_042026-O.webp",
  ],
  warranty: "Garantia do vendedor: 7 dias",
  sku: "BAMBU-A1-A1MINI-AQUECEDOR-CERAMICO-TERMISTOR",
  priceOriginal: "99.90",
  pricePromo: "99.90",
  pixPrice: "99.90",
  installments: 3,
  installmentValue: "33.30",
  stockQuantity: 5,
  featured: true,
  active: true,
  metaTitle: "Aquecedor Cerâmico E Termistor Para Bambu Lab A1 E A1 Mini",
  metaDescription:
    "Kit com aquecedor cerâmico e termistor para Bambu Lab A1 e A1 Mini, com conector, cabo de 16,5 cm e temperatura de trabalho até 300°C.",
  metaKeywords:
    "aquecedor ceramico bambu lab a1, termistor bambu lab a1 mini, aquecedor e termistor a1, reposicao hotend bambu lab, bambu lab a1 mini",
  ogImage: "https://http2.mlstatic.com/D_NQ_NP_838665-MLB110317609179_042026-O.webp",
  categoryId,
  height: 3,
  length: 17,
  weight: "0.120",
  width: 10,
};

const desiredSpecs = [
  ["Marca", "Generica"],
  ["Modelo", "A1 e A1 Mini"],
  ["Formato de venda", "Unidade"],
  ["Resistência do termístor", "100.000 Ω"],
  ["Temperatura mínima suportada", "1 °C"],
  ["Temperatura máxima suportada", "300 °C"],
  ["Material", "Cerâmico"],
  ["Com conector", "Sim"],
  ["Usos recomendados", "Bambu Lab A1 / A1 Mini"],
  ["Comprimento do cabo", "16,5 cm"],
  ["Conteúdo da embalagem", "1 Pc Termistor e Aquecedor Cerâmico"],
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
