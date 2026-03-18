import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "Qodev — Software Agency | Веб и мобильная разработка, UI/UX дизайн",
  description:
    "Qodev — агентство полного цикла разработки. Создаём веб-приложения, мобильные продукты, UI/UX дизайн, DevOps-инфраструктуру. От идеи до масштабирования.",
  keywords: [
    "software agency",
    "веб-разработка",
    "мобильная разработка",
    "UI/UX дизайн",
    "DevOps",
    "разработка приложений",
    "цифровые продукты",
    "стартап разработка",
    "MVP разработка",
    "SaaS разработка",
    "React",
    "Next.js",
    "iOS",
    "Android",
    "Kubernetes",
    "облачная инфраструктура",
    "Qodev",
    "software development",
    "IT агентство",
    "заказная разработка",
  ],
  authors: [{ name: "Qodev" }],
  creator: "Qodev",
  publisher: "Qodev",
  metadataBase: new URL("https://qodev.com"),
  alternates: {
    canonical: "/",
    languages: { "ru-RU": "/" },
  },
  openGraph: {
    title: "Qodev — Software Agency | Разработка цифровых продуктов",
    description:
      "Агентство полного цикла разработки. Веб-приложения, мобильные продукты, UI/UX, DevOps. Превращаем идеи в технологии.",
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Qodev Software Agency",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qodev — Software Agency",
    description:
      "Создаём цифровые продукты: веб, мобайл, дизайн, DevOps. Полный цикл от идеи до масштабирования.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Qodev",
  description:
    "Software agency полного цикла. Веб-разработка, мобильные приложения, UI/UX дизайн, DevOps и облачная инфраструктура.",
  url: "https://qodev.com",
  sameAs: [
    "https://t.me/qodev_agency",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@qodev.com",
    contactType: "sales",
    availableLanguage: ["Russian", "English"],
  },
  knowsAbout: [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "DevOps",
    "Cloud Infrastructure",
    "React",
    "Next.js",
    "Kubernetes",
    "iOS",
    "Android",
  ],
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
