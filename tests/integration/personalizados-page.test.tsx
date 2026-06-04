/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import PersonalizadosPage from "@/app/(site)/personalizados/page";

vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: Record<string, unknown>) => <img alt={String(alt)} {...props} />,
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true,
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

describe("PersonalizadosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra estado vazio quando não há produtos publicados", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string | URL) => {
        const url = String(input);

        if (url.includes("/api/layout?type=header")) {
          return Promise.resolve({
            json: async () => ({ config: { content: { contactPhone: "(11) 99999-9999" } } }),
          });
        }

        if (url.includes("/api/layout?type=page-personalizados")) {
          return Promise.resolve({
            json: async () => ({ config: { content: {} } }),
          });
        }

        if (url.includes("/api/products?category=personalizados")) {
          return Promise.resolve({
            json: async () => ({ products: [] }),
          });
        }

        if (url.includes("/api/pages/personalizados")) {
          return Promise.resolve({
            json: async () => ({ page: { blocks: [] } }),
          });
        }

        return Promise.reject(new Error(`Unhandled fetch: ${url}`));
      }),
    );

    render(<PersonalizadosPage />);

    await waitFor(() => {
      expect(screen.getByText("Ainda não há projetos personalizados publicados.")).toBeDefined();
    });

    expect(screen.queryByText("Logitech G29 Extensor Paddle Shifter")).toBeNull();
  });

  it("renderiza produtos reais retornados pela API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: string | URL) => {
        const url = String(input);

        if (url.includes("/api/layout?type=header")) {
          return Promise.resolve({
            json: async () => ({ config: { content: { contactPhone: "(11) 99999-9999" } } }),
          });
        }

        if (url.includes("/api/layout?type=page-personalizados")) {
          return Promise.resolve({
            json: async () => ({ config: { content: {} } }),
          });
        }

        if (url.includes("/api/products?category=personalizados")) {
          return Promise.resolve({
            json: async () => ({
              products: [
                {
                  id: "prod-1",
                  name: "Case sob medida para sensor",
                  slug: "case-sob-medida-para-sensor",
                  shortDescription: "Projeto real vindo do catálogo.",
                  image: "/uploads/custom/case-sensor.png",
                  category: { name: "Personalizados" },
                },
              ],
            }),
          });
        }

        if (url.includes("/api/pages/personalizados")) {
          return Promise.resolve({
            json: async () => ({ page: { blocks: [] } }),
          });
        }

        return Promise.reject(new Error(`Unhandled fetch: ${url}`));
      }),
    );

    render(<PersonalizadosPage />);

    await waitFor(() => {
      expect(screen.getByText("Case sob medida para sensor")).toBeDefined();
    });

    expect(screen.queryByText("Ainda não há projetos personalizados publicados.")).toBeNull();
  });
});
