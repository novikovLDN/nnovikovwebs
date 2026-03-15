import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Максим Новиков — DevOps Engineer",
  description: "DevOps инженер. Инфраструктура, автоматизация, облачные решения.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
