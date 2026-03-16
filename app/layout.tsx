import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080808",
};

export const metadata: Metadata = {
  title: "Максим Новиков — DevOps инженер | Kubernetes, CI/CD, облачная инфраструктура",
  description:
    "Портфолио DevOps инженера Максима Новикова. 5+ лет опыта: Kubernetes, Docker, CI/CD пайплайны, AWS/GCP, Terraform, мониторинг. Проектирование отказоустойчивой облачной инфраструктуры, автоматизация деплоя, Infrastructure as Code. Открыт к проектам.",
  keywords: [
    "DevOps инженер",
    "DevOps портфолио",
    "Kubernetes",
    "Docker",
    "CI/CD",
    "облачная инфраструктура",
    "AWS",
    "GCP",
    "Terraform",
    "Infrastructure as Code",
    "мониторинг",
    "Prometheus",
    "Grafana",
    "автоматизация",
    "SRE",
    "GitOps",
    "Helm",
    "ArgoCD",
    "DevSecOps",
    "highload",
    "отказоустойчивость",
    "масштабирование",
    "разработчик DevOps",
    "портфолио разработчика",
  ],
  authors: [{ name: "Максим Новиков" }],
  creator: "Максим Новиков",
  publisher: "Максим Новиков",
  metadataBase: new URL("https://novikovdevops.com"),
  alternates: {
    canonical: "/",
    languages: { "ru-RU": "/" },
  },
  openGraph: {
    title: "Максим Новиков — DevOps инженер | Kubernetes, CI/CD, облако",
    description:
      "Портфолио DevOps инженера. 5+ лет: Kubernetes, CI/CD, AWS/GCP, Terraform, мониторинг. Отказоустойчивая инфраструктура для highload-проектов.",
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Максим Новиков — DevOps Engineer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Максим Новиков — DevOps инженер",
    description:
      "DevOps портфолио: Kubernetes, CI/CD, AWS/GCP, Terraform, мониторинг. 5+ лет в продуктовых компаниях.",
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
  "@type": "Person",
  name: "Максим Новиков",
  jobTitle: "DevOps Engineer",
  description:
    "DevOps инженер с опытом 5+ лет. Специализация: Kubernetes, CI/CD, облачная инфраструктура AWS/GCP, Terraform, мониторинг, автоматизация.",
  knowsAbout: [
    "Kubernetes",
    "Docker",
    "CI/CD",
    "AWS",
    "GCP",
    "Terraform",
    "Ansible",
    "Prometheus",
    "Grafana",
    "GitOps",
    "ArgoCD",
    "Helm",
    "DevSecOps",
    "Infrastructure as Code",
    "Site Reliability Engineering",
  ],
  url: "https://novikovdevops.com",
  sameAs: [
    "https://github.com/username",
    "https://linkedin.com/in/username",
    "https://t.me/your_telegram",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Tech Corp",
  },
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
