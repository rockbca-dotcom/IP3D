/**
 * Popula blocos padrão para todas as páginas do sistema que ainda não possuem blocos.
 * Isso permite que o editor visual (/admin/editor/[pageId]) exiba os blocos editáveis.
 *
 * Uso: node scripts/seed-page-blocks.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

const options = parseSeedArgs(process.argv.slice(2));
validateEnvironment("seed-page-blocks.js", options);

const PAGE_BLOCKS = {
  home: [
    {
      type: "hero-slider",
      content: {
        slides: [
          {
            badge: "NOVIDADE",
            title: "Hotend Bambu Lab A1 Mini",
            subtitle: "Reposição Premium",
            description: "Substituição perfeita com encaixe original e alta performance.",
            image: "/images/banners/banner-hero1.png",
            button1Text: "Ver Produto",
            button1Link: "/produtos/hotend-bambu-lab-a1-mini",
            button2Text: "",
            button2Link: "",
          },
          {
            badge: "PROTEÇÃO",
            title: "Capas de Silicone A1",
            subtitle: "Acessório Essencial",
            description: "Proteja seu bloco aquecedor com silicone resistente a altas temperaturas.",
            image: "/images/banners/banner-hero1.png",
            button1Text: "Ver Produto",
            button1Link: "/produtos",
            button2Text: "",
            button2Link: "",
          },
          {
            badge: "DURABILIDADE",
            title: "Bico Nozzle Aço Endurecido",
            subtitle: "Para Bambu Lab A1",
            description: "Compatível com filamentos abrasivos como carbono e fibra de vidro.",
            image: "/images/banners/banner-hero1.png",
            button1Text: "Ver Produto",
            button1Link: "/produtos",
            button2Text: "",
            button2Link: "",
          },
        ],
        autoplaySpeed: 6000,
      },
      order: 0,
      active: true,
    },
    {
      type: "featured-products",
      content: {
        title: "Produtos em Destaque",
        subtitle: "Coleção",
        showNavigation: true,
        limit: 10,
      },
      order: 1,
      active: true,
    },
    {
      type: "why-choose-us",
      content: {
        title: "Excelência em cada detalhe",
        subtitle: "Por que nos escolher",
        description: "A IP3D se dedica a oferecer peças e componentes de alta qualidade para impressoras 3D, com suporte técnico especializado e entrega rápida.",
        features: [
          { icon: "shield", title: "Qualidade Original", description: "Peças com encaixe perfeito e materiais premium." },
          { icon: "cube", title: "Variedade", description: "Componentes para Bambu Lab, Creality e mais." },
          { icon: "support", title: "Suporte Técnico", description: "Equipe pronta para ajudar na escolha certa." },
          { icon: "sparkles", title: "Entrega Rápida", description: "Envio para todo o Brasil com rastreamento." },
        ],
        stats: [
          { value: "500+", label: "Clientes" },
          { value: "2000+", label: "Peças Vendidas" },
          { value: "100%", label: "Original" },
        ],
      },
      order: 2,
      active: true,
    },
    {
      type: "maintenance-preview",
      content: {
        title: "Manutenção Especializada",
        subtitle: "Suporte Técnico",
        description: "Serviço profissional de manutenção e reparo para sua impressora 3D.",
        services: [
          { icon: "wrench", title: "Reparo de Impressoras", description: "Diagnóstico e conserto de problemas mecânicos e eletrônicos." },
          { icon: "clock", title: "Manutenção Preventiva", description: "Programa de manutenção para evitar paradas." },
          { icon: "check", title: "Calibração", description: "Ajuste fino para impressões perfeitas." },
        ],
        buttonText: "Solicitar Suporte",
        buttonLink: "/contato",
      },
      order: 3,
      active: true,
    },
    {
      type: "catalog-cta",
      content: {
        title: "Receba nosso catálogo completo",
        subtitle: "Catálogo Digital",
        description: "Conheça toda nossa linha de peças e componentes para impressoras 3D.",
        phone: "(18) 99692-1583",
        phoneRaw: "5518996921583",
        whatsappMessage: "Olá! Gostaria de receber o catálogo completo da IP3D.",
        buttonText: "Receber Catálogo",
        consultorButtonText: "Falar com Consultor",
      },
      order: 4,
      active: true,
    },
  ],

  contato: [
    {
      type: "contact-hero",
      content: {
        badge: "Fale Conosco",
        title: "Entre em Contato",
        description: "Estamos prontos para ajudar você com peças, orçamentos e dúvidas sobre impressão 3D.",
        image: "/images/hero/1.jpg",
        overlay: 60,
      },
      order: 0,
      active: true,
    },
    {
      type: "contact-options",
      content: {
        cards: [
          { title: "Catálogo", description: "Receba nosso catálogo completo", icon: "download", link: "#catalogo" },
          { title: "Consultor", description: "Fale com um consultor técnico", icon: "phone", link: "#consultor" },
          { title: "Visita", description: "Agende uma visita técnica", icon: "location", link: "#visita" },
        ],
      },
      order: 1,
      active: true,
    },
    {
      type: "contact-info",
      content: {
        phone: "(18) 99692-1583",
        email: "contato@ip3d.com.br",
        address: "São Paulo, SP",
        whatsapp: "5518996921583",
      },
      order: 2,
      active: true,
    },
  ],

  sobre: [
    {
      type: "about-hero",
      content: {
        badge: "Sobre Nós",
        title: "Sua parceira em impressão 3D",
        description: "A IP3D é especializada em peças, componentes e serviços de impressão 3D. Oferecemos produtos de alta qualidade para impressoras Bambu Lab, Creality e outras marcas.",
        image: "/images/background_somos.jpeg",
        overlay: 60,
      },
      order: 0,
      active: true,
    },
    {
      type: "about-mission",
      content: {
        subtitle: "Nossa Missão",
        quote: "Democratizar o acesso à impressão 3D de qualidade, oferecendo peças, componentes e serviços que impulsionam a criatividade e a inovação.",
        author: "Equipe IP3D",
      },
      order: 1,
      active: true,
    },
    {
      type: "about-values",
      content: {
        subtitle: "Nossos Valores",
        title: "O que nos guia",
        values: [
          { icon: "shield", title: "Qualidade", description: "Trabalhamos apenas com componentes de alta qualidade, testados e aprovados." },
          { icon: "sparkles", title: "Agilidade", description: "Entrega rápida e atendimento ágil para você não parar sua produção." },
          { icon: "support", title: "Suporte", description: "Equipe técnica especializada para ajudar em qualquer dúvida." },
          { icon: "cube", title: "Inovação", description: "Sempre atualizados com as últimas tecnologias em impressão 3D." },
        ],
      },
      order: 2,
      active: true,
    },
    {
      type: "about-cta",
      content: {
        title: "Pronto para começar?",
        description: "Entre em contato conosco e descubra como podemos ajudar no seu projeto de impressão 3D.",
        buttonText: "Falar no WhatsApp",
        buttonLink: "https://wa.me/5518996921583?text=Olá! Gostaria de saber mais sobre os produtos e serviços da IP3D.",
        secondaryText: "Enviar E-mail",
        secondaryLink: "/contato",
      },
      order: 3,
      active: true,
    },
  ],

  produtos: [
    {
      type: "products-hero",
      content: {
        badge: "Nosso Catálogo",
        title: "Produtos para Impressão 3D",
        description: "Encontre peças, componentes e acessórios de qualidade para sua impressora 3D.",
      },
      order: 0,
      active: true,
    },
    {
      type: "products-grid",
      content: {
        showFilters: true,
        showSearch: true,
        productsPerPage: 12,
      },
      order: 1,
      active: true,
    },
    {
      type: "products-cta",
      content: {
        title: "Não encontrou o que procura?",
        description: "Entre em contato e ajudamos você a encontrar a peça certa.",
        buttonText: "Falar Conosco",
        buttonLink: "/contato",
      },
      order: 2,
      active: true,
    },
  ],

  "404": [
    {
      type: "lp-404-content",
      content: {
        badge: "Página não encontrada",
        title: "Ops! Esta página não existe.",
        description: "A página que você está procurando pode ter sido removida, renomeada ou nunca existiu.",
        buttons: [
          { text: "Voltar para a Home", link: "/", style: "primary" },
          { text: "Ver Produtos", link: "/produtos", style: "outline" },
        ],
        quickLinksTitle: "Ou acesse diretamente:",
        quickLinks: [
          { label: "Produtos", href: "/produtos" },
          { label: "Sobre", href: "/sobre" },
          { label: "Contato", href: "/contato" },
        ],
        footerText: "",
      },
      order: 0,
      active: true,
    },
  ],
};

async function main() {
  console.log("📌 Populando blocos das páginas do sistema...\n");

  if (options.dryRun) {
    console.log("[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    console.log("   Blocos de páginas padrão a preencher para: home, contato, sobre, produtos, 404");
    return;
  }

  const pages = await prisma.page.findMany({
    include: { blocks: true },
  });

  for (const page of pages) {
    const defaultBlocks = PAGE_BLOCKS[page.slug];

    if (!defaultBlocks) {
      console.log(`   ⏭  ${page.slug}: sem blocos padrão definidos`);
      continue;
    }

    if (page.blocks.length > 0) {
      console.log(`   ✓ ${page.slug}: já possui ${page.blocks.length} blocos (mantidos)`);
      continue;
    }

    // Cria os blocos padrão
    await prisma.pageBlock.createMany({
      data: defaultBlocks.map((block, index) => ({
        pageId: page.id,
        type: block.type,
        content: block.content,
        order: block.order ?? index,
        active: block.active ?? true,
      })),
    });

    console.log(`   ✅ ${page.slug}: ${defaultBlocks.length} blocos criados`);
  }

  console.log("\n✅ Blocos das páginas populados com sucesso!");
  console.log("   → Abra o editor visual no admin para editar cada página.");

  await prisma["$disconnect"]();
}

main().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
