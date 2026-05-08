import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
// TrackingScripts desativado — produção antiga ainda ativa com os mesmos IDs
// Reativar após descomissionar o site antigo
// import { TrackingScripts, TrackingNoscript } from "@/components/TrackingScripts";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { DynamicScripts } from "@/components/DynamicScripts";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("main");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <head>
        {/* Preconnect para recursos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        {/* dns-prefetch removido junto com TrackingScripts */}
        <DynamicFavicon />
        {/* <TrackingScripts /> — desativado, ver comentário no import */}
      </head>
      <body className={`${poppins.variable} ${playfair.variable} font-sans antialiased min-w-[320px]`}>
        {/* <TrackingNoscript /> — desativado */}
        <DynamicScripts />
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
