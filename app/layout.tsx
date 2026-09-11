import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const titulo = "Preço histórico do ouro — 1980 a 2026, em reais e dólares";
const descricao =
  "O preço do ouro mês a mês desde janeiro de 1980, em dólares e em reais, com zoom livre, os ciclos de alta destacados e explicações em linguagem simples.";

export const metadata: Metadata = {
  metadataBase: new URL("https://precoourohistorico.vercel.app"),
  title: titulo,
  description: descricao,
  applicationName: "Preço Histórico do Ouro",
  openGraph: {
    title: titulo,
    description: descricao,
    type: "website",
    locale: "pt_BR",
    url: "https://precoourohistorico.vercel.app",
  },
  twitter: { card: "summary_large_image", title: titulo, description: descricao },
};

export const viewport: Viewport = {
  themeColor: "#0c0b09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
