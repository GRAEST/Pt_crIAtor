import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Graest - Gerador de Planos de Trabalho",
  description: "Plataforma para geração de planos de trabalho de P&D",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen page-bg font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
