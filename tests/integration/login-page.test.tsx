/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import LoginPage from "@/app/login/page";

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("LoginPage", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("redireciona para /admin quando /api/auth/session retorna role administrativa na raiz do payload", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            isLoggedIn: true,
            userId: "admin-1",
            email: "admin@test.com",
            role: "ADMIN",
          }),
      }),
    ) as unknown as typeof global.fetch;

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/admin");
    });
  });
});
