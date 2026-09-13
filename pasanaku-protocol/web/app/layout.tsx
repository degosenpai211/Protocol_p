import type { Metadata } from "next";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/syne/800.css";
import "@pollar/react/styles.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { HideDevChrome } from "@/components/HideDevChrome";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Riel",
  description: "Pasanaku no-custodio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <HideDevChrome />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
