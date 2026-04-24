const { PrismaClient } = require("../node_modules/.prisma/client");

const prisma = new PrismaClient();

const categoryId = "cmmhxuq2l0001pu6jhyv7vfzx";
const slug = "kit-hotend-completo-creality-ender-3-pro-v2-24v-nozzle-cortesia";

const productData = {
  name: "Kit Hotend Completo Creality Ender 3 / Pro / V2 24V",
  slug,
  shortDescription:
    "Kit hotend completo 24V para Ender 3 / Pro / V2 com nozzle de cortesia, cabo de 1 metro e instalação prática.",
  description:
    "<p>Kit hotend completo para impressoras 3D Creality Ender 3, Ender 3 Pro e Ender 3 V2 com tensão de operação de 24V. É uma reposição técnica pensada para restaurar a qualidade de extrusão, facilitar a manutenção e entregar instalação prática no dia a dia.</p><p>O conjunto acompanha nozzle 0,4 mm de cortesia, silicone protetor do bloco, cabo de conexão com 1 metro, tubo PTFE e componentes para reposição completa do sistema de aquecimento. Suporta até 260 °C e atende impressões com PLA, ABS, PETG, TPU e outros materiais compatíveis com essa faixa térmica.</p><p>Seu bloco de aquecimento em alumínio, termistor de alta precisão e resistor cerâmico oferecem desempenho estável, aquecimento eficiente e boa confiabilidade para uso contínuo.</p>",
  features: [
    "Compatível com Creality Ender 3, Ender 3 Pro e Ender 3 V2",
    "Tensão de operação 24V com temperatura máxima de 260 °C",
    "Acompanha nozzle 0,4 mm de cortesia e silicone protetor",
    "Inclui cabo de conexão de 1 metro e tubo PTFE",
    "Instalação prática com encaixe compatível no padrão original",
    "Ideal para manutenção e reposição completa do hotend",
  ],
  image: "/uploads/products/kit-hotend-creality-cr10-detail-1-transparent.png",
  gallery: [
    "/uploads/products/kit-hotend-creality-cr10-detail-1-transparent.png",
    "/uploads/products/kit-hotend-creality-cr10-detail-2.png",
    "/uploads/products/kit-hotend-creality-cr10-ref-1.jpg",
  ],
  warranty: "90 dias",
  sku: "CREALITY-HOTEND-ENDER3-V2-24V",
  priceOriginal: "129.90",
  pricePromo: "119.99",
  pixPrice: "119.99",
  installments: 4,
  installmentValue: "30.00",
  stockQuantity: 25,
  featured: true,
  active: true,
  metaTitle: "Kit Hotend Completo Creality Ender 3 / Pro / V2 24V",
  metaDescription:
    "Kit hotend completo 24V para Ender 3, Ender 3 Pro e Ender 3 V2 com nozzle de cortesia, silicone protetor, cabo e tubo PTFE.",
  metaKeywords: "hotend creality, ender 3, ender 3 v2, hotend 24v, reposição creality",
  ogImage: "/uploads/products/kit-hotend-creality-cr10-detail-1-transparent.png",
  categoryId,
  height: 5,
  length: 16,
  weight: "0.300",
  width: 11,
};

const desiredSpecs = [
  ["Compatibilidade", "Creality Ender 3 / Ender 3 Pro / Ender 3 V2"],
  ["Marca", "Creality"],
  ["Modelo", "2001020048"],
  ["Tensão de operação", "24V"],
  ["Temperatura máxima", "260 °C"],
  ["Tipo de entrada", "Bowden"],
  ["Diâmetro do bico", "0,4 mm"],
  ["Diâmetro do filamento", "1,75 mm"],
  ["Material", "Liga de alumínio com aquecedor cerâmico"],
  ["Itens inclusos", "Hotend, nozzle de cortesia, silicone protetor e tubo PTFE"],
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
