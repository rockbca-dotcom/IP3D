const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxupka0000pu6jwncwyrtl";
const slug = "fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas";

const productData = {
  name: "Fixador De Haste Para Astro A50 Gen4 - Headband Fix 2 Peças",
  slug,
  shortDescription:
    "Fixador reforçado para hastes do Astro A50 Gen4, ideal para corrigir a soltura da espuma superior com encaixe preciso.",
  description:
    "<p>O <strong>Fixador De Haste Para Astro A50 Gen4 - Headband Fix 2 Peças</strong> foi desenvolvido para resolver um problema crônico de soltura das hastes no headset Astro A50 Gen4, restaurando a firmeza da espuma superior e prolongando a vida útil do conjunto.</p><p>Produzido com <strong>tecnologia de impressão 3D</strong>, o kit acompanha <strong>2 presilhas reforçadas</strong> (1 par), oferecendo encaixe preciso, boa estabilidade e instalação simples.</p><p>É uma solução prática para quem busca recuperar o conforto e a estrutura do headset sem precisar substituir o conjunto completo.</p>",
  features: [
    "Compatível com Astro A50 Gen4",
    "Corrige a soltura das hastes superiores",
    "Kit com 2 presilhas reforçadas (1 par)",
    "Produzido com tecnologia de impressão 3D",
    "Instalação simples e encaixe preciso",
    "Ajuda a prolongar a vida útil do headset",
  ],
  image: "https://http2.mlstatic.com/D_NQ_NP_600736-MLB88972505690_082025-O.webp",
  gallery: [
    "https://http2.mlstatic.com/D_NQ_NP_600736-MLB88972505690_082025-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_705440-MLB82015549351_012025-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_842393-MLB75955789651_042024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_974121-MLB75955779595_042024-O.webp",
    "https://http2.mlstatic.com/D_NQ_NP_904305-MLB82015374023_012025-O.webp",
  ],
  warranty: "7 dias",
  sku: "ASTRO-A50-GEN4-HEADBAND-FIX-2PCS",
  priceOriginal: "24.00",
  pricePromo: "22.50",
  pixPrice: "22.50",
  installments: 4,
  installmentValue: "5.63",
  stockQuantity: 50,
  featured: true,
  active: true,
  metaTitle: "Fixador De Haste Para Astro A50 Gen4 - Headband Fix 2 Peças",
  metaDescription:
    "Fixador de haste para Astro A50 Gen4 com 2 presilhas reforçadas, ideal para corrigir a soltura da espuma superior do headset.",
  metaKeywords:
    "astro a50 gen4, headband fix, fixador de haste astro a50, presilha astro a50, headset astro a50, impressão 3d",
  ogImage: "https://http2.mlstatic.com/D_NQ_NP_600736-MLB88972505690_082025-O.webp",
  categoryId,
  height: 3,
  length: 12,
  weight: "0.020",
  width: 8,
};

const desiredSpecs = [
  ["Fabricante", "IP3D"],
  ["Marca", "IP3D"],
  ["Linha", "Astro"],
  ["Modelo", "A50 Gen4"],
  ["Cor", "Preto"],
  ["Quantidade de pares", "1"],
  ["Quantidade de peças", "2 presilhas reforçadas"],
  ["Formato", "Headband Fix"],
  ["Material", "Plástico impresso em 3D"],
  ["Compatibilidade", "Astro A50 Gen4"],
  ["Com microfone", "Não"],
  ["Com luz LED", "Não"],
  ["É sem fio", "Sim"],
  ["Com Bluetooth", "Não"],
  ["Formato do fone de ouvido", "Headset"],
  ["É monaural", "Não"],
  ["É infantil", "Não"],
  ["Função", "Fixação das hastes superiores do headset"],
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
