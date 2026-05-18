import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/products/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  },
}));

function makeRequest(url: string) {
  return new NextRequest(url, { method: "GET" });
}

describe("API /api/products — Filtros e Paginação", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar listagem padrão com paginação", async () => {
    const mockProducts = [
      { id: "1", name: "P1", slug: "p1", priceOriginal: 100, active: true },
      { id: "2", name: "P2", slug: "p2", priceOriginal: 200, active: true },
    ];
    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);
    vi.mocked(prisma.product.count).mockResolvedValue(2);

    const res = await GET(makeRequest("http://localhost/api/products"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(2);
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.total).toBe(2);
  });

  it("deve aplicar filtro de categoria corretamente", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    const res = await GET(makeRequest("http://localhost/api/products?category=eletronicos"));
    await res.json();

    const findManyArgs = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    const categoryCondition = (findManyArgs?.where as any).AND.find((c: any) => 
      c.OR?.some((o: any) => o.category?.slug === "eletronicos" || o.categories?.some?.category?.slug === "eletronicos")
    );
    expect(categoryCondition).toBeDefined();
  });

  it("deve aplicar filtros de preço corretamente", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(makeRequest("http://localhost/api/products?minPrice=50&maxPrice=500"));

    const findManyArgs = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    const where = findManyArgs?.where as any;
    
    expect(where.AND).toBeDefined();
    expect(where.AND.some((c: any) => c.OR?.some((o: any) => o.priceOriginal?.gte === 50))).toBe(true);
  });

  it("deve retornar 400 para query params inválidos", async () => {
    const res = await GET(makeRequest("http://localhost/api/products?page=-1"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("deve retornar 400 se o limite for maior que 50", async () => {
    const res = await GET(makeRequest("http://localhost/api/products?limit=100"));
    const data = await res.json();
    
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("deve aplicar ordenação por preço ascendente", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(makeRequest("http://localhost/api/products?sort=price_asc"));
    
    const findManyArgs = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(findManyArgs?.orderBy).toEqual({ priceOriginal: "asc" });
  });

  it("deve garantir que active: true está sempre presente no filtro", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);
    vi.mocked(prisma.product.count).mockResolvedValue(0);

    await GET(makeRequest("http://localhost/api/products"));
    
    const findManyArgs = vi.mocked(prisma.product.findMany).mock.calls[0][0];
    expect(findManyArgs?.where.active).toBe(true);
  });

  it("deve retornar 500 estruturado em caso de erro no banco", async () => {
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error("DB Error"));

    const res = await GET(makeRequest("http://localhost/api/products"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});

import { GET as GET_SLUG } from "@/app/api/products/[slug]/route";

describe("API /api/products/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar produto por slug se estiver ativo", async () => {
    const mockProduct = { id: "1", name: "P1", slug: "p1", active: true, categoryId: "c1" };
    vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const res = await GET_SLUG(new NextRequest("http://localhost/api/products/p1"), { params: Promise.resolve({ slug: "p1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.product.slug).toBe("p1");
  });

  it("deve retornar 404 para produto inativo ou inexistente", async () => {
    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

    const res = await GET_SLUG(new NextRequest("http://localhost/api/products/inactive"), { params: Promise.resolve({ slug: "inactive" }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NOT_FOUND");
  });
});
