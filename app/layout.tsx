import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Максим Новиков — DevOps Engineer",
  description:
    "DevOps инженер с опытом 5+ лет. Kubernetes, CI/CD, облачная инфраструктура, автоматизация. Открыт к проектам.",
  openGraph: {
    title: "Максим Новиков — DevOps Engineer",
    description:
      "DevOps инженер с опытом 5+ лет. Kubernetes, CI/CD, облачная инфраструктура.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Максим Новиков — DevOps Engineer",
    description:
      "DevOps инженер с опытом 5+ лет. Kubernetes, CI/CD, облачная инфраструктура.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
