/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("AdminSidebar", () => {
  it("oculta links sensíveis de SUPER_ADMIN para usuários ADMIN", () => {
    render(<AdminSidebar role="ADMIN" />);

    expect(screen.queryByText("Usuarios")).toBeNull();
    expect(screen.queryByText("Scripts")).toBeNull();
    expect(screen.queryByText("Configuracoes")).toBeNull();
  });

  it("exibe links sensíveis para SUPER_ADMIN", () => {
    render(<AdminSidebar role="SUPER_ADMIN" />);

    expect(screen.getByText("Usuarios")).toBeDefined();
    expect(screen.getByText("Scripts")).toBeDefined();
    expect(screen.getByText("Configuracoes")).toBeDefined();
  });
});
