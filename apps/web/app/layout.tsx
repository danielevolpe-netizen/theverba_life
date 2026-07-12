import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeLang — Your second life speaks English",
  description: "Learn English by living a persistent life in New York."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
