import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/upload/client/route";
import { requireAdmin } from "@/lib/auth";
import { handleUpload } from "@vercel/blob/client";

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@vercel/blob/client", () => ({
  handleUpload: vi.fn(),
}));

describe("POST /api/upload/client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia usuários não autenticados", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(
      NextResponse.json({ error: "Não autenticado." }, { status: 401 }),
    );

    const request = new NextRequest("http://localhost/api/upload/client", {
      method: "POST",
      body: JSON.stringify({ pathname: "products/file.png" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it("gera token de upload para administradores", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);
    vi.mocked(handleUpload).mockResolvedValue({ ok: true } as never);

    const request = new NextRequest("http://localhost/api/upload/client", {
      method: "POST",
      body: JSON.stringify({ pathname: "products/file.png" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(handleUpload).toHaveBeenCalledTimes(1);
  });
});
