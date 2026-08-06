import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motora — Marketplace Automotivo",
  description:
    "O maior ecossistema automotivo do Brasil. Compre, venda de graça e gerencie veículos em um só lugar.",
};

// Evita flash de tema incorreto aplicando a preferência antes da hidratação.
const themeScript = `(function(){try{var t=localStorage.getItem('motora-theme');if(t){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
