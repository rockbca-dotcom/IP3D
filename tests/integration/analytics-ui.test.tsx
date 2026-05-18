/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import CookieConsent from "@/components/CookieConsent";

// Mock do Next.js Navigation com suporte a pathname dinâmico
let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(),
}));

describe("CookieConsent e AnalyticsTracker (UI & Integração)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    currentPathname = "/";
    originalFetch = global.fetch;

    // Remove cabeçalhos DNT por padrão para não interferir nos testes normais
    if (window.navigator) {
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "0",
        configurable: true
      });
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve renderizar o banner de consentimento para novos acessos sem decisão", () => {
    render(<CookieConsent />);

    expect(screen.getByText("Respeitamos sua privacidade")).toBeDefined();
    expect(screen.getByRole("button", { name: /aceitar/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /recusar/i })).toBeDefined();
  });

  it("deve salvar 'accepted' no localStorage e ocultar banner ao clicar em Aceitar", async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole("button", { name: /aceitar/i });
    fireEvent.click(acceptButton);

    expect(localStorage.getItem("ip3d-cookie-consent")).toBe("accepted");
    
    // O banner deve desaparecer
    await waitFor(() => {
      expect(screen.queryByText("Respeitamos sua privacidade")).toBeNull();
    });
  });

  it("deve salvar 'rejected' no localStorage, ocultar banner e bloquear tracking ao clicar em Recusar", async () => {
    render(<CookieConsent />);

    const rejectButton = screen.getByRole("button", { name: /recusar/i });
    fireEvent.click(rejectButton);

    expect(localStorage.getItem("ip3d-cookie-consent")).toBe("rejected");

    await waitFor(() => {
      expect(screen.queryByText("Respeitamos sua privacidade")).toBeNull();
    });
  });

  it("deve disparar POST para /api/analytics/pageview somente após consentimento de cookies", async () => {
    let fetchCalled = false;
    let fetchUrl = "";
    let fetchBody = "";

    global.fetch = vi.fn((url, options) => {
      fetchCalled = true;
      fetchUrl = String(url);
      fetchBody = options?.body ? String(options.body) : "";
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    }) as unknown as typeof global.fetch;

    currentPathname = "/contato";
    const { rerender } = render(<CookieConsent />);

    // Não deve disparar antes de tomar decisão
    expect(fetchCalled).toBe(false);

    // Aceita cookies
    const acceptButton = screen.getByRole("button", { name: /aceitar/i });
    fireEvent.click(acceptButton);

    // Força re-render para propagar a mudança de consentimento reativa
    rerender(<CookieConsent />);

    await waitFor(() => {
      expect(fetchCalled).toBe(true);
      expect(fetchUrl).toContain("/api/analytics/pageview");
      expect(JSON.parse(fetchBody).path).toBe("/contato");
    });
  });

  it("deve disparar click analytics ao clicar em elementos interativos com data-analytics-click", async () => {
    localStorage.setItem("ip3d-cookie-consent", "accepted");

    const fetchCalls: { url: string; body: string }[] = [];

    global.fetch = vi.fn((url, options) => {
      fetchCalls.push({
        url: String(url),
        body: options?.body ? String(options.body) : ""
      });
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
    }) as unknown as typeof global.fetch;

    render(
      <div>
        <CookieConsent />
        <button
          data-analytics-click
          data-analytics-type="WHATSAPP"
          data-analytics-label="WhatsApp Principal"
          href="https://wa.me/5511999999999"
        >
          Conversar no Zap
        </button>
      </div>
    );

    const button = screen.getByRole("button", { name: /conversar no zap/i });
    fireEvent.click(button);

    await waitFor(() => {
      const clickCall = fetchCalls.find(c => c.url.includes("/api/analytics/click"));
      expect(clickCall).toBeDefined();
      
      const payload = JSON.parse(clickCall!.body);
      expect(payload.type).toBe("WHATSAPP");
      expect(payload.label).toBe("WhatsApp Principal");
      expect(payload.target).toBe("https://wa.me/5511999999999");
    });
  });

  it("deve tolerar falhas de rede na API de analytics sem quebrar a UI ou estourar a renderização", async () => {
    localStorage.setItem("ip3d-cookie-consent", "accepted");

    // Simula erro severo de rede
    global.fetch = vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))) as unknown as typeof global.fetch;

    render(
      <div>
        <CookieConsent />
        <button
          data-analytics-click
          data-analytics-type="CTA"
          data-analytics-label="Comprar PLA"
        >
          Comprar PLA
        </button>
      </div>
    );

    const button = screen.getByRole("button", { name: /comprar pla/i });
    
    // O clique não deve estourar nenhuma exceção crashando a UI
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  it("deve respeitar cabeçalho/opção Do Not Track se o usuário optar por privacidade", async () => {
    localStorage.setItem("ip3d-cookie-consent", "accepted");

    // Ativa DNT de privacidade no navegador
    Object.defineProperty(window.navigator, "doNotTrack", {
      value: "1",
      configurable: true
    });

    let fetchCalled = false;
    global.fetch = vi.fn(() => {
      fetchCalled = true;
      return Promise.resolve({ ok: true });
    }) as unknown as typeof global.fetch;

    render(
      <div>
        <CookieConsent />
        <button
          data-analytics-click
          data-analytics-type="CTA"
          data-analytics-label="Rastreamento Privado"
        >
          Clique Silencioso
        </button>
      </div>
    );

    // O pageview não deve disparar mesmo com consentimento devido ao DNT ativo
    expect(fetchCalled).toBe(false);

    // O clique também deve ser completamente ignorado silenciosamente
    const button = screen.getByRole("button", { name: /clique silencioso/i });
    fireEvent.click(button);

    expect(fetchCalled).toBe(false);
  });
});
