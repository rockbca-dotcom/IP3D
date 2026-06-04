/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import PersonalizadosAdminPage from "@/app/admin/(dashboard)/personalizados/page";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_, prop) =>
          ({ children, ...props }: Record<string, unknown>) => {
            const Tag = prop as keyof JSX.IntrinsicElements;
            return React.createElement(Tag, props, children);
          },
      },
    ),
  };
});

vi.mock("@/components/admin/ImageUpload", () => ({
  ImageUpload: ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div>
      <label>{label}</label>
      <input
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  ),
}));

describe("PersonalizadosAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carrega e salva a configuração page-personalizados via layout admin", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          config: {
            content: {
              heroTitle: "Transforme sua ideia",
              features: [{ title: "Projeto técnico", description: "Detalhamento real." }],
              processSteps: [{ step: "01", title: "Briefing", description: "Entendimento do projeto." }],
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<PersonalizadosAdminPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Transforme sua ideia")).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue("Transforme sua ideia"), {
      target: { value: "Nova headline" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/admin/layout",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("\"type\":\"page-personalizados\""),
        }),
      );
    });
  });
});
