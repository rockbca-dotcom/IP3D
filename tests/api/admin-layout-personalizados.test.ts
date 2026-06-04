import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PUT as saveAdminLayout } from "@/app/api/admin/layout/route";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    layoutConfig: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireEditor: vi.fn(),
}));

function makeRequest(url: string, method = "PUT", body: any = null) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
}

describe("Layout Config Admin — page-personalizados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireEditor).mockResolvedValue(null);
  });

  it("deve salvar page-personalizados usando LayoutConfig", async () => {
    const payload = {
      type: "page-personalizados",
      variant: "main",
      content: {
        heroTitle: "Nova headline",
        features: [{ title: "Projeto técnico", description: "Detalhes" }],
        processSteps: [{ step: "01", title: "Briefing", description: "Levantamento" }],
      },
    };
    vi.mocked(prisma.layoutConfig.upsert).mockResolvedValue({ id: "l2", ...payload } as any);

    const res = await saveAdminLayout(makeRequest("http://localhost/api/admin/layout", "PUT", payload));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.config.type).toBe("page-personalizados");
  });
});
