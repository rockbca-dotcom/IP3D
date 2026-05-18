"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Chave para persistencia no localStorage
const CONSENT_KEY = "ip3d-cookie-consent";

/**
 * Função utilitária de rastreamento de cliques exposta para disparos manuais.
 */
export function trackAnalyticsClick(payload: {
  path: string;
  label: string;
  type: "CTA" | "WHATSAPP" | "EMAIL" | "DOWNLOAD" | "OTHER";
  target?: string;
  referrer?: string;
}) {
  if (typeof window === "undefined") return;

  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent !== "accepted") return;

  // Respeita cabeçalhos de privacidade do navegador (Do Not Track)
  const nav = window.navigator as Navigator & { msDoNotTrack?: string };
  if (nav?.doNotTrack === "1" || nav?.msDoNotTrack === "1") {
    return;
  }

  fetch("/api/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {}); // Falha silenciosamente
}

export default function CookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializa o estado com base no localStorage (roda apenas no browser)
  useEffect(() => {
    const savedConsent = localStorage.getItem(CONSENT_KEY);
    if (savedConsent === "accepted") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setConsent("accepted");
    } else if (savedConsent === "rejected") {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setConsent("rejected");
    } else {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setShowBanner(true);
    }
  }, []);

  // Handler para Aceitar Cookies
  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
    setShowBanner(false);
  }, []);

  // Handler para Recusar Cookies
  const handleReject = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setConsent("rejected");
    setShowBanner(false);
  }, []);

  // Envio de PageView
  const trackPageView = useCallback((path: string) => {
    if (typeof window === "undefined") return;

    // Respeita cabeçalhos de privacidade do navegador (Do Not Track)
    const nav = window.navigator as Navigator & { msDoNotTrack?: string };
    if (nav?.doNotTrack === "1" || nav?.msDoNotTrack === "1") {
      return;
    }

    // Rate Limit / Anti-duplicação: previne envio redundante em 1 segundo
    const sessionKey = `ip3d-pv-${path}`;
    const lastTrackTime = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    if (lastTrackTime && now - Number(lastTrackTime) < 1000) {
      return;
    }
    sessionStorage.setItem(sessionKey, String(now));

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {}); // Falha silenciosamente sem quebrar UI
  }, []);

  // Rastreamento reativo às rotas (Storefront somente)
  useEffect(() => {
    // Ignora páginas da área de administração para manter integridade das métricas do storefront
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    if (consent === "accepted") {
      trackPageView(pathname);
    }
  }, [pathname, searchParams, consent, trackPageView]);

  // Rastreamento global de cliques em CTAs marcados
  useEffect(() => {
    if (consent !== "accepted") return;

    const handleGlobalClick = (e: MouseEvent) => {
      const targetElement = e.target as HTMLElement;
      // Busca o elemento interativo mais próximo com atributo data-analytics-click
      const clickElement = targetElement.closest("[data-analytics-click]") as HTMLElement;
      
      if (clickElement) {
        const typeAttr = clickElement.getAttribute("data-analytics-type") || "CTA";
        const type = ["CTA", "WHATSAPP", "EMAIL", "DOWNLOAD", "OTHER"].includes(typeAttr)
          ? (typeAttr as "CTA" | "WHATSAPP" | "EMAIL" | "DOWNLOAD" | "OTHER")
          : "CTA";

        const label = clickElement.getAttribute("data-analytics-label") || clickElement.innerText || "Botão";
        const targetUrl = clickElement.getAttribute("href") || clickElement.getAttribute("data-target") || undefined;

        trackAnalyticsClick({
          path: window.location.pathname,
          label: label.substring(0, 100),
          type,
          target: targetUrl ? targetUrl.substring(0, 255) : undefined,
          referrer: document.referrer ? document.referrer.substring(0, 255) : undefined
        });
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [consent]);

  // Acessibilidade por teclado: atalhos quando o banner estiver visível
  useEffect(() => {
    if (!showBanner) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleReject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showBanner, handleReject]);

  if (!showBanner) return null;

  return (
    <div 
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-black/95 text-white p-6 shadow-2xl border border-gray-800 z-50 transition-all duration-300 animate-slideUp"
    >
      <div className="space-y-4">
        <h3 id="cookie-consent-title" className="text-sm font-semibold uppercase tracking-wider font-sans">
          Respeitamos sua privacidade
        </h3>
        <p id="cookie-consent-desc" className="text-xs text-gray-400 leading-relaxed font-sans">
          Utilizamos estatísticas de navegação anonimizadas para melhorar sua experiência. Nenhum dado pessoal identificável ou IP bruto é armazenado por nosso sistema.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            aria-label="Aceitar cookies e rastreamento"
          >
            Aceitar
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-2 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            aria-label="Recusar cookies e rastreamento"
          >
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
