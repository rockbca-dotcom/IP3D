const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const placeholderImage = "/images/products/components-placeholder.svg";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIAS
// parentSlug: null  → nível raiz (aparece no menu e no catálogo)
// parentSlug: slug  → sub-categoria (filho, não aparece no menu principal)
// ─────────────────────────────────────────────────────────────────────────────
const categories = [
  // ── RAIZ ──────────────────────────────────────────────────────────────────
  {
    name: "Impressoras 3D",
    slug: "impressoras-3d",
    description: "Impressoras 3D de alta qualidade para uso profissional e doméstico.",
    parentSlug: null,
  },
  {
    name: "Componentes Bambu Lab",
    slug: "componentes-bambu-lab",
    description: "Kits, peças de reposição e upgrades para impressoras Bambu Lab.",
    parentSlug: null,
  },
  {
    name: "Componentes Creality",
    slug: "componentes-creality",
    description: "Peças de reposição para a linha Creality CR e Ender.",
    parentSlug: null,
  },
  {
    name: "Componentes Universais",
    slug: "componentes-universais",
    description: "Sensores, termistores e kits compatíveis com múltiplas impressoras 3D.",
    parentSlug: null,
  },
  {
    name: "Personalizados",
    slug: "personalizados",
    description: "Produtos personalizados e impressões 3D sob demanda.",
    parentSlug: null,
  },

  // ── SUB-CATEGORIAS de Personalizados ──────────────────────────────────────
  // Não aparecem no menu principal (filtradas por parentId != null no Header).
  // Usadas como tag de filtro dentro de /personalizados e nas fichas de produto.
  {
    name: "Headsets",
    slug: "headsets",
    description: "Peças e acessórios impressos em 3D para headsets e fones de ouvido.",
    parentSlug: "personalizados",
  },
  {
    name: "Drones",
    slug: "drones",
    description: "Acessórios e proteções impressos em 3D para drones.",
    parentSlug: "personalizados",
  },
  {
    name: "Starlink",
    slug: "starlink",
    description: "Suportes e acessórios impressos em 3D para equipamentos Starlink.",
    parentSlug: "personalizados",
  },
  {
    name: "Colecionáveis Interativos & Fidgets",
    slug: "colecionaveis-interativos",
    description: "Miniaturas personalizadas, bonecos e itens interativos impressos em 3D.",
    parentSlug: "personalizados",
  },
  {
    name: "Outros",
    slug: "outros",
    description: "Acessórios e peças personalizadas diversas impressas em 3D.",
    parentSlug: "personalizados",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUTOS
// categorySlug    → FK direta (Product.categoryId) — categoria principal
// subCategorySlug → entrada adicional na tabela ProductCategory (junction)
//                   permite filtrar por sub-categoria sem remover o produto
//                   da listagem pai
// ─────────────────────────────────────────────────────────────────────────────
const products = [
  // ══════════════════════════════════════════════════════════════════════════
  // GRUPO 1 — CATÁLOGO PRINCIPAL (componentes e peças)
  // Fonte: Produtos sites 02-03(Planilha1) (2) (1).csv
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "Kit Hotend Completo para Bambu Lab A1 Mini/NORMAL",
    slug: "kit-hotend-bambu-lab-a1",
    shortDescription: "Hotend completo de reposição com barrel, aquecedor e nozzle para as linhas A1 Mini e A1.",
    description:
      "<p>Kit oficial de hotend com corpo metálico, bloco aquecido, cartucho e bico pré-instalado para restauração rápida da Bambu Lab A1 Mini e versão normal.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 50,
    priceOriginal: 249.90,
    pricePromo: 199.90,
    pixPrice: 189.90,
    installments: 3,
    installmentValue: 66.63,
    featured: true,
    active: true,
    features: [
      "Inclui bloco aquecido, dissipador e nozzle 0,4 mm",
      "Compatível com A1 Mini e A1",
      "Substituição plug-and-play",
    ],
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { label: "Conteúdo", value: "Bloco aquecido, heatbreak, nozzle 0,4 mm" },
    ],
  },
  {
    name: "Capa de Silicone (Meia) para Bambu Lab A1 Mini/NORMAL",
    slug: "capa-silicone-bambu-lab-a1",
    shortDescription: "Meia de silicone 300 °C para proteger o bloco aquecido da A1.",
    description:
      "<p>Capa de silicone resistente a altas temperaturas para preservar o bloco aquecido da Bambu Lab A1 Mini e A1, reduzindo o acúmulo de resíduos.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 50,
    priceOriginal: 39.90,
    pricePromo: null,
    pixPrice: 35.90,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Suporta até 300 °C",
      "Material de silicone com isolamento térmico",
      "Instalação rápida com encaixe perfeito",
    ],
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { label: "Temperatura máxima", value: "300 °C" },
    ],
  },
  {
    name: "Bico Nozzle de Aço Endurecido para Bambu Lab A1 Mini/NORMAL",
    slug: "nozzle-aco-bambu-lab-a1",
    shortDescription: "Nozzle 0,4 mm em aço endurecido para filamentos abrasivos.",
    description:
      "<p>Nozzle em aço endurecido 0,4 mm ideal para filamentos com fibra de carbono, vidro ou outros aditivos abrasivos nas impressoras A1.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 50,
    priceOriginal: 79.90,
    pricePromo: null,
    pixPrice: 71.90,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Bico 0,4 mm em aço endurecido",
      "Maior durabilidade com filamentos abrasivos",
      "Rosca padrão do hotend A1",
    ],
    specs: [
      { label: "Material", value: "Aço endurecido" },
      { label: "Diâmetro", value: "0,4 mm" },
    ],
  },
  {
    name: "Limpador de Bico (Nozzle Wiper) para Bambu Lab A1",
    slug: "nozzle-wiper-bambu-lab-a1",
    shortDescription: "Espátula de limpeza para a sequência automática de purga da A1.",
    description:
      "<p>Peça de reposição do wiper que remove o excesso de material durante a rotina de limpeza automática da Bambu Lab A1.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 50,
    priceOriginal: 44.90,
    pricePromo: null,
    pixPrice: 40.40,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Superfície em silicone flexível",
      "Fixação rápida no suporte original",
      "Compatível com rotina de limpeza padrão",
    ],
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1" },
      { label: "Material", value: "Silicone e base metálica" },
    ],
  },
  {
    name: "Kit Termistor para Bambu Lab A1 / A1 Mini",
    slug: "kit-termistor-bambu-lab-a1",
    shortDescription: "Conjunto com termistor NTC e cartucho aquecedor para hotend A1.",
    description:
      "<p>Kit completo com termistor NTC e cartucho aquecedor para reposição preventiva no hotend A1, garantindo leituras de temperatura precisas.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 10,
    priceOriginal: 89.90,
    pricePromo: 79.90,
    pixPrice: 71.90,
    installments: 2,
    installmentValue: 39.95,
    featured: false,
    active: true,
    features: [
      "Cartucho aquecedor 24 V",
      "Termistor NTC calibrado",
      "Conectores compatíveis com chicote original",
    ],
    specs: [
      { label: "Tensão", value: "24 V" },
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
    ],
  },
  {
    name: "Mesa PEI Texturizada Dupla Face para Bambu Lab H2D (350 x 320 mm)",
    slug: "mesa-pei-bambu-lab-h2d",
    shortDescription: "Placa PEI texturizada dupla face para plataforma H2D 350×320 mm.",
    description:
      "<p>Superfície PEI texturizada dupla face para a Bambu Lab H2D, oferecendo aderência superior e fácil remoção das peças impressas.</p>",
    categorySlug: "componentes-bambu-lab",
    stockQuantity: 10,
    priceOriginal: 349.90,
    pricePromo: 299.90,
    pixPrice: 269.90,
    installments: 6,
    installmentValue: 49.98,
    featured: true,
    active: true,
    features: [
      "Revestimento PEI texturizado em ambas as faces",
      "Base flexível para remoção rápida",
      "Formato 350 x 320 mm para H2D",
    ],
    specs: [
      { label: "Dimensões", value: "350 x 320 mm" },
      { label: "Compatibilidade", value: "Bambu Lab H2D" },
    ],
  },
  {
    name: "Kit Aquecedor Cerâmico 60W 360° e Termistor",
    slug: "kit-aquecedor-ceramico-60w",
    shortDescription: "Cartucho cerâmico 60 W com termistor integrado para hotends universais.",
    description:
      "<p>Kit com cartucho cerâmico 60 W e termistor 360° para reposição em hotends que exigem aquecimento rápido e precisão térmica.</p>",
    categorySlug: "componentes-universais",
    stockQuantity: 100,
    priceOriginal: 89.90,
    pricePromo: 69.90,
    pixPrice: 62.90,
    installments: 2,
    installmentValue: 34.95,
    featured: false,
    active: true,
    features: [
      "Cartucho cerâmico 60 W",
      "Termistor com leitura 360°",
      "Compatível com hotends padrão V6 e derivados",
    ],
    specs: [
      { label: "Potência", value: "60 W" },
      { label: "Tensão", value: "24 V" },
    ],
  },
  {
    name: "Kit Hotend Completo para Creality CR-10",
    slug: "kit-hotend-creality-cr10",
    shortDescription: "Hotend metálico completo compatível com CR-10 e variações.",
    description:
      "<p>Conjunto completo de hotend metálico para impressoras Creality CR-10, pronto para substituição com heatbreak, bloco e nozzle.</p>",
    categorySlug: "componentes-creality",
    stockQuantity: 50,
    priceOriginal: 199.90,
    pricePromo: 159.90,
    pixPrice: 143.90,
    installments: 3,
    installmentValue: 53.30,
    featured: true,
    active: true,
    features: [
      "Heatbreak totalmente metálico",
      "Nozzle 0,4 mm pré-instalado",
      "Compatível com CR-10 e derivados",
    ],
    specs: [
      { label: "Compatibilidade", value: "Creality CR-10 / CR-10S" },
      { label: "Diâmetro do bico", value: "0,4 mm" },
    ],
  },
  {
    name: "Termistor NTC 100K 1% 3950 (Resistente até 200 °C)",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Termistor NTC 100K de alta precisão para múltiplos hotends.",
    description:
      "<p>Termistor NTC 100K com precisão de 1% e curva 3950, ideal para upgrades de hotends em diversas impressoras 3D.</p>",
    categorySlug: "componentes-universais",
    stockQuantity: 100,
    priceOriginal: 34.90,
    pricePromo: null,
    pixPrice: 29.90,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Precisão 1%",
      "Curva Beta 3950",
      "Temperatura de operação até 200 °C",
    ],
    specs: [
      { label: "Tipo", value: "NTC 100K 3950" },
      { label: "Temperatura suportada", value: "Até 200 °C" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // GRUPO 2 — PERSONALIZADOS IMPRESSOS EM 3D
  // Fonte: Produtos site(personalizados) (1).csv
  //
  // Regras deste grupo:
  //   • categorySlug = "personalizados"  (categoria pai — aparece no catálogo)
  //   • subCategorySlug = sub-categoria específica (junction ProductCategory)
  //   • stockQuantity = 0  (impressão sob demanda — sem estoque pré-impresso)
  //   • priceOriginal = null  (exibe "Sob consulta" — preços via WhatsApp/ML)
  //   • featured = false  (não aparecem em "Mais Vendidos" por padrão)
  //
  // IMAGENS: nenhuma disponível ainda. Placeholder ativo.
  // Carregar imagens reais e atualizar via Admin → Produtos.
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "Logitech G29 Extensor Paddle Shifter Mad Volante Mod",
    slug: "logitech-g29-extensor-paddle",
    shortDescription: "Extensor de paddle shifter impresso em 3D para volante Logitech G29.",
    description:
      "<p>Peça impressa em 3D que estende os paddle shifters do volante Logitech G29, melhorando o alcance e a ergonomia para simuladores de corrida. Encaixe preciso sem modificação permanente no volante.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "outros",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Encaixe preciso nos paddle shifters do G29",
      "Sem modificação permanente no volante",
      "Material PETG resistente",
    ],
    specs: [
      { label: "Compatibilidade", value: "Logitech G29" },
      { label: "Material", value: "PETG" },
    ],
  },
  {
    name: "Fixador de Haste para Astro A50 Gen4 — Headband Fix (2 peças) Preto",
    slug: "fixador-haste-astro-a50-gen4",
    shortDescription: "Kit com 2 peças fixadoras de haste para headset Astro A50 Gen4.",
    description:
      "<p>Kit com 2 peças (esquerdo e direito) para fixar a haste do headset Astro A50 Gen4. Resolve o problema de quebra da haste original sem necessidade de comprar um novo headset. Cor preta.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "headsets",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Kit com 2 peças (esquerda e direita)",
      "Solução econômica para haste quebrada",
      "Cor preta",
    ],
    specs: [
      { label: "Compatibilidade", value: "Astro A50 Gen4" },
      { label: "Quantidade", value: "2 peças" },
      { label: "Cor", value: "Preto" },
    ],
  },
  {
    name: "Starlink Luva/Suporte para Fixação de Antena com Trava 1,5 Inch",
    slug: "starlink-suporte-antena",
    shortDescription: "Suporte com trava para fixação da antena Starlink em poste de 1,5 polegada.",
    description:
      "<p>Luva/suporte impressa em 3D para fixação da antena Starlink em postes ou mastros de 1,5 polegada, com sistema de trava de segurança integrado. Material resistente à exposição UV.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "starlink",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Sistema de trava de segurança integrado",
      "Compatível com poste/mastro de 1,5 polegada",
      "Material resistente a UV",
    ],
    specs: [
      { label: "Diâmetro de encaixe", value: "1,5 polegada (38 mm)" },
      { label: "Compatibilidade", value: "Starlink V2 / V3" },
    ],
  },
  {
    name: "Kit 2x Dobradiças de Reposição para Fone Audio-Technica ATH-M40x",
    slug: "kit-dobradicas-audio-technica-m40x",
    shortDescription: "Kit com 2 dobradiças (hinges) de reposição para Audio-Technica ATH-M40x.",
    description:
      "<p>Kit com par de dobradiças (hinges) de reposição para o fone de ouvido Audio-Technica ATH-M40x. Evita a troca do headphone completo quando a dobradiça original quebra. Encaixe idêntico ao original.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "headsets",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Par completo de dobradiças (2 unidades)",
      "Encaixe idêntico ao original",
      "Cor preta",
    ],
    specs: [
      { label: "Compatibilidade", value: "Audio-Technica ATH-M40x" },
      { label: "Quantidade", value: "2 dobradiças" },
    ],
  },
  {
    name: "Suporte para Base de Carregamento Robô Aspirador Xiaomi Vacuum — Branco",
    slug: "suporte-base-xiaomi-vacum",
    shortDescription: "Suporte impresso em 3D para a base de carregamento do robô aspirador Xiaomi.",
    description:
      "<p>Suporte para fixação da base de carregamento do robô aspirador Xiaomi Vacuum em parede ou superfície, mantendo o ambiente organizado. Cor branca, impressão em PLA.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "outros",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Fixa a base de carregamento na parede",
      "Cor branca",
      "Impressão em PLA de alta qualidade",
    ],
    specs: [
      { label: "Compatibilidade", value: "Robô aspirador Xiaomi Vacuum" },
      { label: "Cor", value: "Branco" },
    ],
  },
  {
    name: "Proteção Drone DJI Neo — Protetor de Hélice, Câmera e Controle — Preto",
    slug: "protecao-drone-dji-neo",
    shortDescription: "Kit de proteção completo para hélice, câmera e controle do drone DJI Neo.",
    description:
      "<p>Kit de proteção impresso em 3D para o drone DJI Neo: inclui protetor de hélice, protetor de câmera e protetor de controle remoto. Material resistente a impactos. Cor preta.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "drones",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Protege hélice, câmera e controle",
      "Material resistente a impactos",
      "Cor preta",
    ],
    specs: [
      { label: "Compatibilidade", value: "Drone DJI Neo" },
      { label: "Cor", value: "Preto" },
    ],
  },
  {
    name: "Astro A50 Headband Fix — Adaptador para Headband Steelseries — Preto",
    slug: "astro-a50-headband-fix-steelseries",
    shortDescription: "Adaptador que permite usar headband Steelseries no Astro A50 quebrado.",
    description:
      "<p>Adaptador impresso em 3D que permite usar a headband (arco de cabeça) da Steelseries no headset Astro A50, substituindo o arco original quebrado por uma solução econômica e resistente. Cor preta.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "headsets",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Compatível com headband Steelseries padrão",
      "Solução econômica para haste quebrada",
      "Cor preta",
    ],
    specs: [
      { label: "Compatibilidade", value: "Astro A50 + Steelseries Headband" },
      { label: "Cor", value: "Preto" },
    ],
  },
  {
    name: "Boneco Miniatura Personalizado com Sua Foto — Bobblehead 3D",
    slug: "boneco-miniatura-bobblehead-3d",
    shortDescription: "Boneco miniatura personalizado no estilo Bobblehead com rosto do cliente.",
    description:
      "<p>Boneco miniatura personalizado impresso em 3D com as características físicas do cliente, no estilo Bobblehead (cabeça articulada). Ideal para presentes únicos, decoração e colecionáveis. Sob encomenda — consulte prazo de produção.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "colecionaveis-interativos",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Personalizado com foto do cliente",
      "Estilo Bobblehead (cabeça articulada)",
      "Produção sob encomenda",
    ],
    specs: [
      { label: "Material", value: "PLA com acabamento pintado" },
      { label: "Entrega", value: "Sob demanda — consulte prazo" },
    ],
  },
  {
    name: "Suporte de Parede para Adaptador Ethernet Starlink",
    slug: "suporte-ethernet-starlink",
    shortDescription: "Suporte de parede para o adaptador Ethernet do kit Starlink.",
    description:
      "<p>Suporte impresso em 3D para fixar o adaptador Ethernet Starlink na parede, mantendo o cabo organizado e o adaptador protegido e acessível.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "starlink",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Encaixe perfeito no adaptador Ethernet Starlink",
      "Fixação em parede ou superfície",
      "Organiza o cabeamento",
    ],
    specs: [
      { label: "Compatibilidade", value: "Adaptador Ethernet Starlink" },
    ],
  },
  {
    name: "Suporte de Lanterna Superior para Drone DJI Neo (Voo Noturno) — Branco",
    slug: "suporte-lanterna-dji-neo",
    shortDescription: "Suporte para lanterna fixado no topo do DJI Neo para voos noturnos.",
    description:
      "<p>Suporte impresso em 3D para fixação de lanterna no topo do drone DJI Neo, viabilizando voos noturnos com iluminação auxiliar. Cor branca, material resistente às vibrações de voo.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "drones",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Fixação segura no topo do DJI Neo",
      "Viabiliza voos noturnos",
      "Cor branca",
    ],
    specs: [
      { label: "Compatibilidade", value: "Drone DJI Neo" },
      { label: "Cor", value: "Branco" },
    ],
  },
  {
    name: "Suporte de Parede para Roteador Xiaomi AX3600/AX6000 — Kit",
    slug: "suporte-parede-xiaomi-ax3600",
    shortDescription: "Kit de suporte de parede para roteadores Xiaomi AX3600 e AX6000.",
    description:
      "<p>Kit de suporte impresso em 3D para fixação dos roteadores Xiaomi AX3600 e AX6000 na parede, economizando espaço e melhorando a ventilação e organização do ambiente.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "outros",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Compatível com AX3600 e AX6000",
      "Economia de espaço e melhor ventilação",
      "Kit completo para instalação em parede",
    ],
    specs: [
      { label: "Compatibilidade", value: "Xiaomi AX3600 / AX6000" },
    ],
  },
  {
    name: "Suporte de Radiador Externo Water Cooler PC — Preto",
    slug: "suporte-radiador-water-cooler-pc",
    shortDescription: "Suporte impresso em 3D para fixação de radiador externo de water cooler.",
    description:
      "<p>Suporte impresso em 3D para fixação de radiador externo de water cooler em gabinetes de PC. Alta resistência estrutural para suportar o peso do radiador e manter o sistema de refrigeração estável. Cor preta.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "outros",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Alta resistência estrutural (PETG reforçado)",
      "Suporta radiadores de water cooler",
      "Cor preta",
    ],
    specs: [
      { label: "Material", value: "PETG reforçado" },
      { label: "Cor", value: "Preto" },
    ],
  },
  {
    name: "Peça de Reposição Audio-Technica ATH-M40x Yoke/Haste — Par — Preto",
    slug: "peca-reposicao-audio-technica-m40x-yoke",
    shortDescription: "Par de yokes (hastes de articulação) de reposição para ATH-M40x.",
    description:
      "<p>Par de yokes (hastes de articulação) de reposição para o fone Audio-Technica ATH-M40x. Resolve o problema de quebra da haste de articulação original sem necessidade de comprar um novo headphone. Encaixe idêntico ao original. Cor preta.</p>",
    categorySlug: "personalizados",
    subCategorySlug: "headsets",
    stockQuantity: 0,
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    featured: false,
    active: true,
    features: [
      "Par completo (esquerdo e direito)",
      "Encaixe idêntico ao original",
      "Cor preta",
    ],
    specs: [
      { label: "Compatibilidade", value: "Audio-Technica ATH-M40x" },
      { label: "Quantidade", value: "2 yokes (par completo)" },
      { label: "Cor", value: "Preto" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const categoryMap = {};

  // Pass 1: categorias raiz (sem parentSlug)
  for (const cat of categories.filter((c) => !c.parentSlug)) {
    const { parentSlug, ...catData } = cat;
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: catData,
      create: catData,
    });
    categoryMap[cat.slug] = saved.id;
  }

  // Pass 2: sub-categorias (com parentSlug)
  for (const cat of categories.filter((c) => c.parentSlug)) {
    const { parentSlug, ...catData } = cat;
    const parentId = categoryMap[parentSlug];
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { ...catData, parentId },
      create: { ...catData, parentId },
    });
    categoryMap[cat.slug] = saved.id;
  }

  console.log(`\n✓ ${categories.length} categorias processadas (${categories.filter(c => !c.parentSlug).length} raiz, ${categories.filter(c => c.parentSlug).length} sub).\n`);

  for (const product of products) {
    const { categorySlug, subCategorySlug = null, specs, featured, active, ...productFields } = product;
    const categoryId = categoryMap[categorySlug];

    const baseData = {
      ...productFields,
      image: placeholderImage,
      gallery: [placeholderImage],
      video: null,
      catalog: null,
      warranty: null,
      featured: featured ?? false,
      active: active ?? true,
      categoryId,
    };

    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });

    let saved;
    if (existing) {
      saved = await prisma.product.update({ where: { id: existing.id }, data: baseData });
      await prisma.specification.deleteMany({ where: { productId: existing.id } });
    } else {
      saved = await prisma.product.create({ data: baseData });
    }

    if (specs?.length) {
      await prisma.specification.createMany({
        data: specs.map((spec) => ({
          productId: saved.id,
          label: spec.label,
          value: spec.value,
        })),
      });
    }

    // Entrada na junction ProductCategory para a categoria principal
    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: { productId: saved.id, categoryId },
      },
      update: {},
      create: { productId: saved.id, categoryId },
    });

    // Entrada adicional para sub-categoria (se definida)
    if (subCategorySlug) {
      const subCategoryId = categoryMap[subCategorySlug];
      if (subCategoryId) {
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: { productId: saved.id, categoryId: subCategoryId },
          },
          update: {},
          create: { productId: saved.id, categoryId: subCategoryId },
        });
      }
    }

    console.log(`  ✓ [${categorySlug}${subCategorySlug ? " / " + subCategorySlug : ""}] ${saved.name}`);
  }

  const g1 = products.filter((p) => p.categorySlug !== "personalizados").length;
  const g2 = products.filter((p) => p.categorySlug === "personalizados").length;

  console.log(`\n✅ Seed concluído: ${products.length} produtos (${g1} componentes + ${g2} personalizados) em ${categories.length} categorias.\n`);
  console.log("⚠️  AÇÕES PENDENTES:\n");
  console.log("  GRUPO 1 — Componentes (imagens: carregar nas pastas e atualizar via Admin → Produtos):");
  console.log("    kit-hotend-bambu-lab-a1         → public/images/products/hotend-bambu-a1/");
  console.log("    capa-silicone-bambu-lab-a1      → public/images/products/silicone-bambu-a1/");
  console.log("    nozzle-aco-bambu-lab-a1         → public/images/products/nozzle-bambu-a1/");
  console.log("    nozzle-wiper-bambu-lab-a1       → public/images/products/wiper-bambu-a1/");
  console.log("    kit-termistor-bambu-lab-a1      → public/images/products/termistor-bambu-a1/");
  console.log("    mesa-pei-bambu-lab-h2d          → public/images/products/mesa-pei-h2d/");
  console.log("    kit-aquecedor-ceramico-60w      → public/images/products/aquecedor-ceramico/");
  console.log("    kit-hotend-creality-cr10        → public/images/products/hotend-creality-cr10/");
  console.log("    termistor-ntc-100k-3950         → public/images/products/termistor-ntc/");
  console.log("");
  console.log("  GRUPO 2 — Personalizados (imagens + PREÇOS pendentes):");
  console.log("    logitech-g29-extensor-paddle    → public/images/products/logitech-g29-extensor-paddle/");
  console.log("    fixador-haste-astro-a50-gen4    → public/images/products/fixador-astro-a50-gen4/");
  console.log("    starlink-suporte-antena         → public/images/products/starlink-suporte-antena/");
  console.log("    kit-dobradicas-audio-technica-m40x → public/images/products/dobradicas-audio-technica-m40x/");
  console.log("    suporte-base-xiaomi-vacum       → public/images/products/suporte-xiaomi-vacum/");
  console.log("    protecao-drone-dji-neo          → public/images/products/protecao-dji-neo/");
  console.log("    astro-a50-headband-fix-steelseries → public/images/products/astro-a50-headband-steelseries/");
  console.log("    boneco-miniatura-bobblehead-3d  → public/images/products/boneco-bobblehead-3d/");
  console.log("    suporte-ethernet-starlink       → public/images/products/suporte-ethernet-starlink/");
  console.log("    suporte-lanterna-dji-neo        → public/images/products/suporte-lanterna-dji-neo/");
  console.log("    suporte-parede-xiaomi-ax3600    → public/images/products/suporte-parede-xiaomi-ax3600/");
  console.log("    suporte-radiador-water-cooler-pc → public/images/products/suporte-radiador-water-cooler/");
  console.log("    peca-reposicao-audio-technica-m40x-yoke → public/images/products/yoke-audio-technica-m40x/");
  console.log("");
  console.log("  • Preços do Grupo 2: todos exibem 'Sob consulta'. Definir via Admin → Produtos.");
  console.log("  • Revisar preços do Grupo 1 contra planilha 'Produtos sites 02-03' antes de publicar.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
