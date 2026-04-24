import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Painel",
  description: "Painel administrativo",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
