/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
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

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
    return;
  }

  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("Home SSR", () => {
  it("não injeta produtos hardcoded quando o banco não está disponível", async () => {
    delete process.env.DATABASE_URL;

    const { default: Home } = await import("@/app/(site)/page");
    render(await Home());

    expect(screen.getByText("Mapa de componentes")).toBeDefined();
    expect(
      screen.queryByText("Kit Hotend Completo Creality Ender 3 / Pro / V2 24V"),
    ).toBeNull();
    expect(screen.queryByText("Boneco Bobblehead 3D Personalizado")).toBeNull();
  });
});
