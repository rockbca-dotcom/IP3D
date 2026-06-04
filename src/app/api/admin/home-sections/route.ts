import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const homeSectionSchema = z.object({
  sectionId: z.string().min(1, "sectionId é obrigatório"),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  content: z.any().nullable().optional(),
  image: z.string().nullable().optional(),
  active: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
});

const DEFAULT_SECTIONS = [
  {
    sectionId: "why-choose-us",
    title: "Excelência em cada detalhe",
    subtitle: "Por que nos escolher",
    description: "Qualidade e excelência em cada produto, com suporte especializado e atendimento dedicado.",
    content: {
      features: [
        { icon: "shield", title: "Qualidade Garantida", description: "Produtos selecionados com alto padrão de qualidade." },
        { icon: "cube", title: "Tecnologia", description: "Soluções inovadoras para impressão 3D." },
        { icon: "support", title: "Suporte Especializado", description: "Equipe técnica pronta para ajudar." },
        { icon: "sparkles", title: "Experiência Premium", description: "Atendimento consultivo e personalizado." },
      ],
      stats: [
        { value: "10+", label: "Anos" },
        { value: "500+", label: "Clientes" },
        { value: "100%", label: "Original" },
      ],
    },
    order: 1,
  },
  {
    sectionId: "maintenance-preview",
    title: "Manutenção",
    subtitle: "Suporte Técnico",
    description: "Equipe técnica especializada para manter seus equipamentos em perfeito funcionamento.",
    content: {
      services: [
        { icon: "wrench", title: "Manutenção Preventiva", description: "Revisões periódicas e prevenção." },
        { icon: "clock", title: "Atendimento Rápido", description: "Agilidade no suporte técnico." },
        { icon: "check", title: "Peças Originais", description: "Somente peças homologadas." },
      ],
      buttonText: "Solicitar Manutenção",
      buttonLink: "/contato",
    },
    order: 2,
  },
  {
    sectionId: "catalog-cta",
    title: "Receba nosso catálogo completo",
    subtitle: "Catálogo Digital",
    description: "Conheça toda a linha de produtos e especificações técnicas.",
    content: {
      phone: "",
      phoneRaw: "",
      whatsappMessage: "Olá! Gostaria de falar com um consultor.",
      buttonText: "Receber Catálogo",
      consultorButtonText: "Falar com Consultor",
    },
    order: 3,
  },
];

async function ensureDefaultSections() {
  await Promise.all(
    DEFAULT_SECTIONS.map((section) =>
      prisma.homeSection.upsert({
        where: { sectionId: section.sectionId },
        update: {},
        create: {
          sectionId: section.sectionId,
          title: section.title,
          subtitle: section.subtitle,
          description: section.description,
          content: section.content,
          order: section.order,
          active: true,
        },
      })
    )
  );
}

export async function GET() {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    await ensureDefaultSections();

    const sections = await prisma.homeSection.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ sections });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const rawData = await request.json();
    const data = homeSectionSchema.parse(rawData);

    const section = await prisma.homeSection.upsert({
      where: { sectionId: data.sectionId },
      update: {
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        description: data.description ?? null,
        content: data.content ?? {},
        image: data.image ?? null,
        active: data.active !== false,
        order: Number(data.order ?? 0),
      },
      create: {
        sectionId: data.sectionId,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        description: data.description ?? null,
        content: data.content ?? {},
        image: data.image ?? null,
        active: data.active !== false,
        order: Number(data.order ?? 0),
      },
    });

    return apiSuccess({ success: true, section });
  } catch (error) {
    return handleApiError(error);
  }
}

