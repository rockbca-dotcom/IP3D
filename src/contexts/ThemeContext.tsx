"use client";

import { createContext, useContext, useEffect } from "react";

// ---------------------------------------------------------------------------
// Dark mode DESATIVADO temporariamente — locked to "light".
//
// O ThemeProvider e useTheme são preservados com a mesma interface pública
// para que todos os consumidores existentes continuem compilando sem erro.
//
// Para reativar:
//   1. Restaurar os useState / useEffect abaixo (ver git history)
//   2. Reabilitar <ThemeToggle /> em AdminTopbar.tsx
//   3. Remover `color-scheme: light` de globals.css e layout.tsx
//
// Motivo da desativação: dark mode parcialmente estilizado causava
// inconsistência visual em aparelhos com modo escuro ativo no sistema.
// ---------------------------------------------------------------------------

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";

    try {
      localStorage.setItem("admin-theme", "light");
    } catch {
      // Storage can be unavailable in strict privacy modes; the DOM lock above is enough.
    }
  }, []);

  // Theme locked to "light". ThemeProvider renders children immediately,
  // without the mounted-guard that previously caused a blank first load.
  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
