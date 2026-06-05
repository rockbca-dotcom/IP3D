import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GET as getAdminPages } from "@/app/api/admin/pages/route";
import { GET as getAdminBanners } from "@/app/api/admin/banners/route";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    banner: {
      findMany: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireEditor: vi.fn(),
}));

function prismaSchemaError(code: "P2021" | "P2022") {
  return new Prisma.PrismaClientKnownRequestError("legacy schema mismatch", {
    code,
    clientVersion: "5.22.0",
  });
}

describe("Admin legacy schema compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireEditor).mockResolvedValue(null);
  });

  it("returns legacy pages instead of failing when the Page schema is older", async () => {
    vi.mocked(prisma.page.upsert).mockResolvedValue({} as never);
    vi.mocked(prisma.page.findMany).mockRejectedValue(prismaSchemaError("P2022"));
    vi.mocked(prisma.$queryRawUnsafe)
      .mockResolvedValueOnce([
        { column_name: "id" },
        { column_name: "name" },
        { column_name: "slug" },
      ] as never)
      .mockResolvedValueOnce([
        { id: "page-1", name: "Home", slug: "home" },
      ] as never)
      .mockResolvedValueOnce([] as never);

    const response = await getAdminPages();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pages).toEqual([
      expect.objectContaining({
        id: "page-1",
        name: "Home",
        slug: "home",
        isSystem: true,
        published: true,
        _count: { blocks: 0 },
      }),
    ]);
  });

  it("returns legacy banners instead of failing when Banner has newer fields in code than in db", async () => {
    vi.mocked(prisma.banner.findMany).mockRejectedValue(prismaSchemaError("P2022"));
    vi.mocked(prisma.$queryRawUnsafe)
      .mockResolvedValueOnce([
        { column_name: "id" },
        { column_name: "title" },
        { column_name: "active" },
        { column_name: "order" },
      ] as never)
      .mockResolvedValueOnce([
        { id: "banner-1", title: "Banner legado", active: true, order: 0 },
      ] as never);

    const response = await getAdminBanners();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.banners).toEqual([
      expect.objectContaining({
        id: "banner-1",
        title: "Banner legado",
        active: true,
        order: 0,
      }),
    ]);
  });
});
