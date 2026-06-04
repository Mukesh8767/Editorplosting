import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sustainability Editor",
  description: "Content studio for sustainability articles, authors, and brochures.",
  icons: {
    icon: '/urllogo.webp',
    shortcut: '/urllogo.webp',
    apple: '/urllogo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
