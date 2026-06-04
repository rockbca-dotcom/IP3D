import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as getPublicBanners } from "@/app/api/banners/route";
import { GET as getPublicHomeSections } from "@/app/api/home-sections/route";
import { GET as getPublicLayout } from "@/app/api/layout/route";
import { GET as getAdminBanners, POST as createAdminBanner } from "@/app/api/admin/banners/route";
import { PUT as updateAdminBanner, DELETE as deleteAdminBanner } from "@/app/api/admin/banners/[id]/route";
import { GET as getAdminHomeSections, POST as saveAdminHomeSection } from "@/app/api/admin/home-sections/route";
import { GET as getAdminLayout, PUT as saveAdminLayout } from "@/app/api/admin/layout/route";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import { Prisma } from "@prisma/client";


vi.mock("@/lib/prisma", () => ({
  prisma: {
    banner: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    homeSection: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    layoutConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireEditor: vi.fn(),
}));

function makeRequest(url: string, method = "GET", body: any = null) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
}

describe("CMS & Layout API Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("APIs Públicas", () => {
    describe("GET /api/banners", () => {
      it("deve retornar apenas banners ativos ordenados corretamente", async () => {
        const mockBanners = [
          { id: "b1", title: "Banner 1", active: true, order: 1 },
          { id: "b2", title: "Banner 2", active: true, order: 2 },
        ];
        vi.mocked(prisma.banner.findMany).mockResolvedValue(mockBanners as any);

        const res = await getPublicBanners();
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.banners).toHaveLength(2);
        expect(vi.mocked(prisma.banner.findMany)).toHaveBeenCalledWith({
          where: { active: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        });
      });
    });

    describe("GET /api/home-sections", () => {
      it("deve retornar apenas seções de home ativas", async () => {
        const mockSections = [
          { id: "s1", sectionId: "why-choose-us", active: true, order: 1 },
        ];
        vi.mocked(prisma.homeSection.findMany).mockResolvedValue(mockSections as any);

        const res = await getPublicHomeSections(makeRequest("http://localhost/api/home-sections"));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.sections).toHaveLength(1);
      });

      it("deve buscar uma seção específica ativa se sectionId for passado", async () => {
        const mockSection = { id: "s1", sectionId: "why-choose-us", active: true };
        vi.mocked(prisma.homeSection.findFirst).mockResolvedValue(mockSection as any);

        const res = await getPublicHomeSections(makeRequest("http://localhost/api/home-sections?sectionId=why-choose-us"));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.section.sectionId).toBe("why-choose-us");
        expect(vi.mocked(prisma.homeSection.findFirst)).toHaveBeenCalledWith({
          where: { sectionId: "why-choose-us", active: true },
        });
      });
    });

    describe("GET /api/layout", () => {
      it("deve retornar 400 se type não for informado", async () => {
        const res = await getPublicLayout(makeRequest("http://localhost/api/layout"));
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error.code).toBe("BAD_REQUEST");
      });

      it("deve retornar as configurações de layout correspondentes", async () => {
        const mockConfig = { id: "l1", type: "header", variant: "main", content: {} };
        vi.mocked(prisma.layoutConfig.findUnique).mockResolvedValue(mockConfig as any);

        const res = await getPublicLayout(makeRequest("http://localhost/api/layout?type=header"));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.config.type).toBe("header");
      });
    });
  });

  describe("APIs Administrativas (CMS & Layout)", () => {
    describe("Segurança & RBAC (requireEditor)", () => {
      it("deve bloquear requisições administrativas se o usuário não for autenticado", async () => {
        vi.mocked(requireEditor).mockResolvedValue(
          NextResponse.json({ error: "Não autenticado." }, { status: 401 })
        );

        const res = await getAdminBanners();
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.error).toBe("Não autenticado.");
      });
    });

    describe("Banners Admin — /api/admin/banners", () => {
      beforeEach(() => {
        vi.mocked(requireEditor).mockResolvedValue(null);
      });

      it("deve buscar todos os banners (ativos e inativos) para o admin", async () => {
        const mockBanners = [
          { id: "b1", title: "B1", active: true },
          { id: "b2", title: "B2", active: false },
        ];
        vi.mocked(prisma.banner.findMany).mockResolvedValue(mockBanners as any);

        const res = await getAdminBanners();
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.banners).toHaveLength(2);
      });

      it("deve criar um novo banner com payload válido", async () => {
        const payload = { title: "Novo Banner", active: true, order: 5 };
        vi.mocked(prisma.banner.create).mockResolvedValue({ id: "new-b", ...payload } as any);

        const res = await createAdminBanner(makeRequest("http://localhost/api/admin/banners", "POST", payload));
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.banner.title).toBe("Novo Banner");
      });

      it("deve retornar 400 se o payload de criação for inválido (sem título)", async () => {
        const payload = { active: true };
        const res = await createAdminBanner(makeRequest("http://localhost/api/admin/banners", "POST", payload));
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error.code).toBe("BAD_REQUEST");
      });
    });

    describe("Single Banner Admin — /api/admin/banners/[id]", () => {
      beforeEach(() => {
        vi.mocked(requireEditor).mockResolvedValue(null);
      });

      it("deve atualizar um banner existente", async () => {
        const payload = { title: "Banner Atualizado", order: 2 };
        vi.mocked(prisma.banner.update).mockResolvedValue({ id: "b1", ...payload } as any);

        const res = await updateAdminBanner(
          makeRequest("http://localhost/api/admin/banners/b1", "PUT", payload),
          { params: Promise.resolve({ id: "b1" }) }
        );
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it("deve retornar 404 ao atualizar um banner inexistente", async () => {
        const payload = { title: "Banner Inexistente" };
        const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
          code: "P2025",
          clientVersion: "5.22.0",
        });
        vi.mocked(prisma.banner.update).mockRejectedValue(prismaError);

        const res = await updateAdminBanner(
          makeRequest("http://localhost/api/admin/banners/b-missing", "PUT", payload),
          { params: Promise.resolve({ id: "b-missing" }) }
        );
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.error.code).toBe("NOT_FOUND");
      });

      it("deve excluir um banner", async () => {
        vi.mocked(prisma.banner.delete).mockResolvedValue({ id: "b1" } as any);

        const res = await deleteAdminBanner(
          makeRequest("http://localhost/api/admin/banners/b1", "DELETE"),
          { params: Promise.resolve({ id: "b1" }) }
        );
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });

    describe("Home Sections Admin — /api/admin/home-sections", () => {
      beforeEach(() => {
        vi.mocked(requireEditor).mockResolvedValue(null);
      });

      it("deve salvar/upsert uma seção de home com payload válido", async () => {
        const payload = { sectionId: "why-choose-us", title: "Novo Título", active: true };
        vi.mocked(prisma.homeSection.upsert).mockResolvedValue({ id: "s1", ...payload } as any);

        const res = await saveAdminHomeSection(
          makeRequest("http://localhost/api/admin/home-sections", "POST", payload)
        );
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
      });

      it("deve persistir arrays ricos em content para a home", async () => {
        const payload = {
          sectionId: "why-choose-us",
          title: "Novo título",
          active: true,
          content: {
            features: [
              { icon: "shield", title: "Garantia", description: "Descrição" },
            ],
            stats: [{ value: "10+", label: "Projetos" }],
          },
        };
        vi.mocked(prisma.homeSection.upsert).mockResolvedValue({ id: "s2", ...payload } as any);

        const res = await saveAdminHomeSection(
          makeRequest("http://localhost/api/admin/home-sections", "POST", payload)
        );
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(vi.mocked(prisma.homeSection.upsert)).toHaveBeenCalledWith(
          expect.objectContaining({
            update: expect.objectContaining({
              content: payload.content,
            }),
            create: expect.objectContaining({
              content: payload.content,
            }),
          })
        );
      });
    });

    describe("Layout Config Admin — /api/admin/layout", () => {
      beforeEach(() => {
        vi.mocked(requireEditor).mockResolvedValue(null);
      });

      it("deve salvar layout com upsert de type e variant", async () => {
        const payload = { type: "header", variant: "main", content: { links: [] } };
        vi.mocked(prisma.layoutConfig.upsert).mockResolvedValue({ id: "l1", ...payload } as any);

        const res = await saveAdminLayout(makeRequest("http://localhost/api/admin/layout", "PUT", payload));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.config.type).toBe("header");
      });
    });
  });
});
