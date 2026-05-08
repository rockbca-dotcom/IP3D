"use client";

// TrackingScripts - configure via environment variables before use
// GTM_ID, GA4_ID e META_PIXEL_ID devem ser definidos no .env como variáveis NEXT_PUBLIC_*
// Este componente está desativado do layout.tsx até o site antigo ser descomissionado

export function TrackingScripts() {
  // Nenhum script de tracking hardcoded.
  // Configure os IDs via variáveis de ambiente e reative no layout.tsx.
  return null;
}

export function TrackingNoscript() {
  return null;
}
