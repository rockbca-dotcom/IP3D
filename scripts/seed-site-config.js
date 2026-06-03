/**
 * Seed de configurações do site — popula LayoutConfig, Settings, Banners e HomeSections.
 * Rode com: node scripts/seed-site-config.js
 *
 * Idempotente: usa upsert, pode rodar em qualquer banco sem duplicar.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

const options = parseSeedArgs(process.argv.slice(2));
validateEnvironment("seed-site-config.js", options);

// ── Header Config ─────────────────────────────────────────────────────────────
const HEADER_CONFIG = {
  logoUrl: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  logoWhiteUrl: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  subtitle: "",
  subtitleLine2: "",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Produtos", href: "/produtos" },
    { label: "Personalizados", href: "/personalizados" },
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ],
  ctaButtons: [
    { label: "Solicitar Orçamento", href: "/contato", variant: "outline" },
  ],
  contactEmail: "contato@ip3d.com.br",
  contactPhone: "018 9 9692-1583",
  contactCity: "Palmital, SP",
};

// ── Footer Config ─────────────────────────────────────────────────────────────
const FOOTER_CONFIG = {
  logoUrl: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  subtitle: "Integração completa IP3D",
  description: "Integramos hardware, componentes e suporte especializado para manufatura aditiva profissional no Brasil.",
  contactEmail: "contato@ip3d.com.br",
  contactPhone: "018 9 9692-1583",
  contactAddress: "Rua Golden Park",
  contactCity: "Palmital • São Paulo",
  linkGroups: [
    {
      title: "Soluções",
      links: [
        { label: "Hotends e Bicos", href: "/categorias/componentes-bambu-lab" },
        { label: "Componentes Eletrônicos", href: "/categorias/componentes-creality" },
        { label: "Peças Mecânicas", href: "/categorias/componentes-universais" },
        { label: "Superfícies de Impressão", href: "/categorias/impressoras-3d" },
        { label: "Impressoras 3D", href: "/categorias/impressoras-3d-equipamentos" },
        { label: "Personalizados", href: "/personalizados" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Sobre a IP3D", href: "/sobre" },
        { label: "Contato", href: "/contato" },
      ],
    },
  ],
  socialLinks: [
    { platform: "instagram", href: "https://instagram.com/ip3d.oficial" },
    { platform: "linkedin", href: "https://linkedin.com/company/ip3d" },
    { platform: "youtube", href: "https://youtube.com/@ip3d" },
    { platform: "whatsapp", href: "https://wa.me/5518996921583" },
  ],
  copyrightText: "© {year} IP3D. Todos os direitos reservados.",
};

// ── Site Settings ─────────────────────────────────────────────────────────────
const SITE_SETTINGS = {
  siteName: "IP3D",
  siteDescription: "IP3D: equipamentos e insumos para impressão 3D.",
  logo: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  logoDark: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  favicon: "/favicon.ico",
  phone: "018 9 9692-1583",
  whatsapp: "5518996921583",
  email: "contato@ip3d.com.br",
  address: "Rua Golden Park, Palmital - SP",
  cnpj: "",
  workingHours: "Seg à Sex: 9h às 18h",
  instagram: "https://instagram.com/ip3d.oficial",
  facebook: "",
  linkedin: "https://linkedin.com/company/ip3d",
  youtube: "https://youtube.com/@ip3d",
  seoConfig: {
    main: {
      title: "IP3D – Tecnologia em Impressão 3D",
      description: "IP3D: equipamentos, componentes e suporte técnico para impressão 3D profissional.",
      favicon: "/favicon.ico",
      keywords: "impressão 3d, impressora 3d, hotend, bambu lab, creality, componentes, peças",
    },
  },
};

// ── Banners (Hero Slides) ─────────────────────────────────────────────────────
const BANNERS = [
  {
    title: "Hotend Bambu Lab A1 Mini",
    badge: "Reposição premium",
    subtitle: "PEÇA DE SUBSTITUIÇÃO",
    description: "Troca rápida e desempenho estável para manter sua A1 Mini imprimindo com precisão e consistência.",
    image: "/images/banners/banner-hero1.png",
    button1Text: "Ver produto",
    button1Link: "/produtos/hotend-bambu-lab-a1-mini",
    button2Text: "Solicitar no WhatsApp",
    button2Link: "https://wa.me/5518996921583",
    crosshairPos: { top: "45%", left: "68%" },
    techLabels: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 Mini" },
      { label: "FUNÇÃO", value: "Reposição / upgrade" },
      { label: "STATUS", value: "PRONTO PARA USO" },
    ],
    order: 0,
    active: true,
  },
  {
    title: "Capas de Silicone A1",
    badge: "Proteção premium",
    subtitle: "PROTEÇÃO TÉRMICA",
    description: "Proteção estável para o bloco aquecido, com encaixe preciso para manter sua A1/A1 Mini pronta para produção.",
    image: "/images/banners/banner-hero2.png",
    button1Text: "Ver produto",
    button1Link: "/produtos/capa-silicone-bambu-lab-a1",
    button2Text: "Solicitar no WhatsApp",
    button2Link: "https://wa.me/5518996921583",
    crosshairPos: { top: "46%", left: "49%" },
    techLabels: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 / A1 Mini" },
      { label: "FUNÇÃO", value: "Proteção térmica" },
      { label: "STATUS", value: "PRONTA PARA USO" },
    ],
    order: 1,
    active: true,
  },
  {
    title: "Bico Nozzle Aço Endurecido",
    badge: "Precisão técnica",
    subtitle: "ALTA DURABILIDADE",
    description: "Mais resistência para materiais abrasivos, com encaixe preciso e estabilidade para uso contínuo na A1 Mini.",
    image: "/images/banners/banner-hero3.png",
    button1Text: "Ver produto",
    button1Link: "/produtos/nozzle-aco-bambu-lab-a1",
    button2Text: "Solicitar no WhatsApp",
    button2Link: "https://wa.me/5518996921583",
    crosshairPos: { top: "45%", left: "66%" },
    techLabels: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 Mini / A1" },
      { label: "MATERIAL", value: "Aço endurecido" },
      { label: "STATUS", value: "PRONTO PARA USO" },
    ],
    order: 2,
    active: true,
  },
];

// ── Home Sections ─────────────────────────────────────────────────────────────
const HOME_SECTIONS = [
  {
    sectionId: "why-choose-us",
    title: "Por que nos escolher",
    subtitle: "DIFERENCIAIS",
    description: "Qualidade, suporte técnico e entrega rápida para todo o Brasil.",
    active: true,
    order: 1,
  },
  {
    sectionId: "partnership",
    title: "Parceria",
    subtitle: "FABRICANTES",
    description: "Trabalhamos com as melhores marcas do mercado de impressão 3D.",
    active: true,
    order: 2,
  },
  {
    sectionId: "maintenance-preview",
    title: "Manutenção",
    subtitle: "SERVIÇOS",
    description: "Serviço técnico especializado para manter seu equipamento operando em máxima performance.",
    active: true,
    order: 3,
  },
  {
    sectionId: "catalog-cta",
    title: "Solicite nosso catálogo completo",
    subtitle: "CATÁLOGO",
    description: "Baixe o catálogo digital com todos os produtos, especificações técnicas e preços.",
    active: true,
    order: 4,
  },
];

// ── Execução ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔧 Populando configurações do site...\n");

  if (options.dryRun) {
    console.log("[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    console.log("   Configurações a atualizar: Header, Footer, Site Settings, Home Sections, Page Configs");
    console.log(`   Banners a recriar: ${BANNERS.length}`);
    return;
  }

  // 1. Header Layout
  console.log("📌 Header...");
  await prisma.layoutConfig.upsert({
    where: { type_variant: { type: "header", variant: "main" } },
    update: { content: HEADER_CONFIG },
    create: { type: "header", variant: "main", content: HEADER_CONFIG },
  });
  console.log("   ✓ Header configurado");

  // 2. Footer Layout
  console.log("📌 Footer...");
  await prisma.layoutConfig.upsert({
    where: { type_variant: { type: "footer", variant: "main" } },
    update: { content: FOOTER_CONFIG },
    create: { type: "footer", variant: "main", content: FOOTER_CONFIG },
  });
  console.log("   ✓ Footer configurado");

  // 3. Site Settings
  console.log("📌 Configurações gerais...");
  await prisma.setting.upsert({
    where: { key: "site-settings-main" },
    update: { value: SITE_SETTINGS },
    create: { key: "site-settings-main", value: SITE_SETTINGS },
  });
  console.log("   ✓ Settings salvos");

  // 4. Banners
  console.log("📌 Banners do Hero...");
  // Limpar banners antigos e recriar
  await prisma.banner.deleteMany({});
  for (const banner of BANNERS) {
    await prisma.banner.create({ data: banner });
    console.log(`   ✓ ${banner.title}`);
  }

  // 5. Home Sections
  console.log("📌 Seções da Homepage...");
  for (const section of HOME_SECTIONS) {
    await prisma.homeSection.upsert({
      where: { sectionId: section.sectionId },
      update: section,
      create: section,
    });
    console.log(`   ✓ ${section.sectionId}: ${section.title}`);
  }

  // 6. Page Configs (Personalizados e Sobre)
  console.log("📌 Config das páginas...");
  await prisma.layoutConfig.upsert({
    where: { type_variant: { type: "page-personalizados", variant: "main" } },
    update: { content: {
      heroImage: "/images/pesonalizados-hero.jpg",
      heroTagline: "Impressão 3D Sob Demanda",
      heroTitle: "Transformamos suas",
      heroHighlight: "ideias",
      heroDescription: "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional.",
      ctaTitle: "Tem um projeto em mente?",
      ctaDescription: "Entre em contato conosco e transforme sua ideia em realidade. Orçamento sem compromisso!",
      features: [
        { title: "Modelagem 3D", description: "Criamos o modelo 3D a partir do seu desenho, foto ou ideia." },
        { title: "Materiais Diversos", description: "PLA, PETG, ABS, TPU flexível, fibra de carbono e mais." },
        { title: "Alta Precisão", description: "Impressão com resolução de até 0.1mm para detalhes perfeitos." },
        { title: "Entrega Rápida", description: "Prazos ágeis para projetos urgentes." },
      ],
      processSteps: [
        { step: "01", title: "Envie sua ideia", description: "Mande seu arquivo 3D, desenho, foto ou descrição do que precisa." },
        { step: "02", title: "Orçamento", description: "Analisamos seu projeto e enviamos um orçamento detalhado." },
        { step: "03", title: "Aprovação", description: "Após aprovação, iniciamos a produção da sua peça." },
        { step: "04", title: "Entrega", description: "Sua peça é finalizada e enviada com todo cuidado." },
      ],
    } },
    create: { type: "page-personalizados", variant: "main", content: {
      heroImage: "/images/pesonalizados-hero.jpg",
      heroTagline: "Impressão 3D Sob Demanda",
      heroTitle: "Transformamos suas",
      heroHighlight: "ideias",
      heroDescription: "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional.",
      ctaTitle: "Tem um projeto em mente?",
      ctaDescription: "Entre em contato conosco e transforme sua ideia em realidade. Orçamento sem compromisso!",
      features: [
        { title: "Modelagem 3D", description: "Criamos o modelo 3D a partir do seu desenho, foto ou ideia." },
        { title: "Materiais Diversos", description: "PLA, PETG, ABS, TPU flexível, fibra de carbono e mais." },
        { title: "Alta Precisão", description: "Impressão com resolução de até 0.1mm para detalhes perfeitos." },
        { title: "Entrega Rápida", description: "Prazos ágeis para projetos urgentes." },
      ],
      processSteps: [
        { step: "01", title: "Envie sua ideia", description: "Mande seu arquivo 3D, desenho, foto ou descrição do que precisa." },
        { step: "02", title: "Orçamento", description: "Analisamos seu projeto e enviamos um orçamento detalhado." },
        { step: "03", title: "Aprovação", description: "Após aprovação, iniciamos a produção da sua peça." },
        { step: "04", title: "Entrega", description: "Sua peça é finalizada e enviada com todo cuidado." },
      ],
    } },
  });
  console.log("   ✓ Personalizados");

  await prisma.layoutConfig.upsert({
    where: { type_variant: { type: "page-sobre", variant: "main" } },
    update: { content: {
      heroImage: "/images/background_somos.jpeg",
      heroTagline: "Sobre Nós",
      heroTitle: "Especialistas em",
      heroHighlight: "impressão 3D",
      heroDescription: "Peças, componentes e impressão 3D com suporte técnico para projetos sob medida.",
      missionTitle: "Nossa Missão",
      missionQuote: "Democratizar o acesso à impressão 3D de qualidade, oferecendo peças, componentes e serviços que impulsionam a criatividade e a inovação.",
      missionAuthor: "Equipe IP3D",
      ctaTitle: "Pronto para começar?",
      ctaDescription: "Entre em contato conosco e descubra como podemos ajudar no seu projeto de impressão 3D.",
      stats: [
        { value: "500+", label: "Clientes Atendidos" },
        { value: "2000+", label: "Peças Vendidas" },
        { value: "50+", label: "Produtos no Catálogo" },
        { value: "24h", label: "Tempo de Resposta" },
      ],
    } },
    create: { type: "page-sobre", variant: "main", content: {
      heroImage: "/images/background_somos.jpeg",
      heroTagline: "Sobre Nós",
      heroTitle: "Especialistas em",
      heroHighlight: "impressão 3D",
      heroDescription: "Peças, componentes e impressão 3D com suporte técnico para projetos sob medida.",
      missionTitle: "Nossa Missão",
      missionQuote: "Democratizar o acesso à impressão 3D de qualidade, oferecendo peças, componentes e serviços que impulsionam a criatividade e a inovação.",
      missionAuthor: "Equipe IP3D",
      ctaTitle: "Pronto para começar?",
      ctaDescription: "Entre em contato conosco e descubra como podemos ajudar no seu projeto de impressão 3D.",
      stats: [
        { value: "500+", label: "Clientes Atendidos" },
        { value: "2000+", label: "Peças Vendidas" },
        { value: "50+", label: "Produtos no Catálogo" },
        { value: "24h", label: "Tempo de Resposta" },
      ],
    } },
  });
  console.log("   ✓ Sobre");

  console.log("\n✅ Configurações do site populadas com sucesso!");
  console.log("   → Header, Footer, Settings, Banners e Seções da Home");
  console.log("   → Tudo editável via /admin");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
