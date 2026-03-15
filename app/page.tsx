"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll(".reveal, .reveal-left").forEach((c) =>
        observer.observe(c)
      );
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useTyping(texts: string[], speed = 70, pause = 2200) {
  const [display, setDisplay] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplay(current.slice(0, charIdx + 1));
          if (charIdx + 1 === current.length)
            setTimeout(() => setDeleting(true), pause);
          else setCharIdx(charIdx + 1);
        } else {
          setDisplay(current.slice(0, charIdx));
          if (charIdx === 0) {
            setDeleting(false);
            setIdx((idx + 1) % texts.length);
          } else setCharIdx(charIdx - 1);
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return display;
}

function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  return ref;
}

/* ═══════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════ */

const NAV = [
  { href: "#about", label: "Обо мне" },
  { href: "#skills", label: "Навыки" },
  { href: "#projects", label: "Проекты" },
  { href: "#experience", label: "Опыт" },
  { href: "#contact", label: "Контакт" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#080808ee] backdrop-blur-xl border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="font-[var(--font-display)] text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-[var(--accent)]">N</span>
          <span className="text-[var(--text-primary)]">.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 tracking-wide"
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" className="ml-4 btn-primary !py-2.5 !px-6 !text-[12px]">
            Связаться
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[var(--text-primary)] w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menu"
        >
          <span
            className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-[1.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[var(--bg-elevated)] border-t border-[var(--border)] px-6 py-4 space-y-1">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors border-b border-[var(--border)] last:border-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   AMBIENT BACKGROUND
   ═══════════════════════════════════════════════════ */

function AmbientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-right glow */}
      <div
        className="absolute -top-[30%] -right-[20%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-left glow */}
      <div
        className="absolute -bottom-[20%] -left-[15%] w-[50vw] h-[50vw] rounded-full opacity-[0.03]"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
        }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text-faint) 1px, transparent 1px), linear-gradient(90deg, var(--text-faint) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════════════ */

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useScrollReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="reveal flex items-center gap-3 mb-4">
      <div className="accent-dot" />
      <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">
        {text}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="reveal text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-14"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const SKILLS_CATEGORIES = [
  {
    title: "Облако и Инфраструктура",
    items: ["AWS", "GCP", "Terraform", "Ansible", "Packer"],
  },
  {
    title: "Контейнеризация",
    items: ["Docker", "Kubernetes", "Helm", "Istio", "ArgoCD"],
  },
  {
    title: "CI/CD и Автоматизация",
    items: ["GitLab CI", "GitHub Actions", "Jenkins", "Bash", "Python"],
  },
  {
    title: "Мониторинг",
    items: ["Prometheus", "Grafana", "Loki", "Jaeger", "ELK Stack"],
  },
];

const PROJECTS = [
  {
    num: "01",
    title: "K8s Cluster Autopilot",
    desc: "Автоматическое масштабирование и самовосстановление кластеров Kubernetes с кастомными операторами",
    tags: ["Kubernetes", "Go", "Prometheus"],
    accent: true,
  },
  {
    num: "02",
    title: "CI/CD Pipeline Engine",
    desc: "Универсальный конвейер для микросервисной архитектуры с canary-релизами и автоматическим откатом",
    tags: ["GitLab CI", "ArgoCD", "Docker"],
    accent: false,
  },
  {
    num: "03",
    title: "Infra-as-Code Platform",
    desc: "Платформа управления облачной инфраструктурой с drift detection и policy enforcement",
    tags: ["Terraform", "AWS", "Python"],
    accent: false,
  },
  {
    num: "04",
    title: "Observability Stack",
    desc: "Полный стек мониторинга, логирования и трейсинга с кастомными дашбордами и алертингом",
    tags: ["Grafana", "Loki", "Tempo"],
    accent: true,
  },
];

const EXPERIENCE = [
  {
    period: "2022 — н.в.",
    role: "Senior DevOps Engineer",
    company: "Tech Corp",
    desc: "Проектирование облачной инфраструктуры, внедрение GitOps, оптимизация CI/CD пайплайнов. Сокращение времени деплоя на 70%.",
  },
  {
    period: "2020 — 2022",
    role: "DevOps Engineer",
    company: "Cloud Solutions",
    desc: "Миграция on-premise в AWS, настройка мониторинга и алертинга, автоматизация рутинных операций.",
  },
  {
    period: "2018 — 2020",
    role: "System Administrator",
    company: "StartupXYZ",
    desc: "Администрирование Linux-серверов, внедрение контейнеризации, настройка сетевой инфраструктуры.",
  },
];

const STATS = [
  { value: "5+", label: "лет опыта" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "50+", label: "проектов" },
  { value: "70%", label: "быстрее деплой" },
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const typed = useTyping(
    [
      "строю облачную инфраструктуру",
      "автоматизирую CI/CD пайплайны",
      "оркеструю контейнеры",
      "проектирую отказоустойчивые системы",
    ],
    65,
    2000
  );

  const heroRef = useScrollReveal();

  return (
    <div className="grain">
      <AmbientBg />
      <Nav />

      {/* ═══ HERO ═══ */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center px-6 lg:px-10"
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-16 items-center">
          <div>
            <div className="reveal flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" />
              <span className="text-[12px] tracking-[0.2em] uppercase text-[var(--text-secondary)] font-medium">
                DevOps Engineer
              </span>
            </div>

            <h1
              className="reveal text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[var(--text-primary)]">Никита</span>
              <br />
              <span className="gradient-text">Новиков</span>
            </h1>

            <div className="reveal mt-8 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl">
              <span>{typed}</span>
              <span
                className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-1 align-middle"
                style={{ animation: "blink 1s step-end infinite" }}
              />
            </div>

            <div className="reveal mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary">
                Связаться
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#projects" className="btn-secondary">
                Проекты
              </a>
            </div>
          </div>

          {/* Right side — abstract decoration */}
          <div className="hidden lg:block relative">
            <div className="w-72 h-72 relative">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full border border-[var(--border)]"
                style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
              />
              {/* Inner content */}
              <div className="absolute inset-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-5xl font-bold gradient-text"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    5+
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 tracking-wider uppercase">
                    лет опыта
                  </div>
                </div>
              </div>
              {/* Decorative dots */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 accent-dot" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 accent-dot" />
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 accent-dot" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 accent-dot" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div
            className="flex flex-col items-center gap-2 text-[var(--text-muted)]"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <div className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl md:text-4xl font-bold text-[var(--accent)]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </div>
              <div className="text-[12px] text-[var(--text-muted)] mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ABOUT ═══ */}
      <Section id="about">
        <SectionLabel text="Обо мне" />
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">
          <div>
            <SectionTitle>
              Создаю надёжную
              <br />
              <span className="text-[var(--text-secondary)]">инфраструктуру</span>
            </SectionTitle>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-lg">
              DevOps инженер с опытом 5+ лет. Специализируюсь на построении
              и автоматизации облачной инфраструктуры, Kubernetes, CI/CD
              и observability.
            </p>
            <p className="reveal mt-4 text-[var(--text-secondary)] leading-relaxed max-w-lg">
              Превращаю сложные инфраструктурные задачи в элегантные
              автоматизированные решения. GitOps, immutable infrastructure,
              culture of reliability.
            </p>
          </div>

          {/* Values cards */}
          <div className="grid gap-4">
            {[
              {
                title: "Автоматизация",
                desc: "Всё, что делается руками больше двух раз, должно быть автоматизировано",
              },
              {
                title: "Надёжность",
                desc: "Проектирование систем с учётом отказоустойчивости и быстрого восстановления",
              },
              {
                title: "Масштабируемость",
                desc: "Инфраструктура, которая растёт вместе с бизнесом без боли",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`reveal stagger-${i + 1} card card-glow p-6`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="accent-dot" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SKILLS ═══ */}
      <Section id="skills">
        <SectionLabel text="Навыки" />
        <SectionTitle>
          Технологии и<br />
          <span className="text-[var(--text-secondary)]">инструменты</span>
        </SectionTitle>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS_CATEGORIES.map((cat, i) => (
            <div key={cat.title} className={`reveal stagger-${i + 1}`}>
              <h3 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.items.map((skill) => (
                  <div
                    key={skill}
                    className="group flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-300 cursor-default"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ PROJECTS ═══ */}
      <Section id="projects">
        <SectionLabel text="Проекты" />
        <SectionTitle>
          Избранные
          <br />
          <span className="text-[var(--text-secondary)]">работы</span>
        </SectionTitle>

        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <div
              key={project.num}
              className={`reveal stagger-${i + 1} card card-glow p-7 group cursor-pointer ${
                project.accent
                  ? "border-[var(--border-accent)]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <span
                  className="text-4xl font-bold text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors duration-500"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {project.num}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
                >
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>

              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                {project.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                {project.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ EXPERIENCE ═══ */}
      <Section id="experience">
        <SectionLabel text="Опыт" />
        <SectionTitle>
          Карьерный
          <br />
          <span className="text-[var(--text-secondary)]">путь</span>
        </SectionTitle>

        <div className="space-y-6">
          {EXPERIENCE.map((exp, i) => (
            <div
              key={exp.period}
              className={`reveal stagger-${i + 1} card p-7 group`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="accent-dot" />
                    <h3
                      className="text-xl font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {exp.role}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--accent)] mb-3 ml-5">
                    {exp.company}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed ml-5">
                    {exp.desc}
                  </p>
                </div>
                <span className="text-[12px] tracking-wider text-[var(--text-muted)] uppercase whitespace-nowrap font-medium md:mt-1">
                  {exp.period}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ CONTACT ═══ */}
      <Section id="contact">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">
          <div>
            <SectionLabel text="Контакт" />
            <SectionTitle>
              Давайте
              <br />
              <span className="text-[var(--text-secondary)]">работать вместе</span>
            </SectionTitle>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-md">
              Открыт к интересным предложениям и проектам.
              Обычно отвечаю в течение 24 часов.
            </p>
          </div>

          <div className="reveal space-y-4">
            {[
              {
                label: "Email",
                value: "your@email.com",
                href: "mailto:your@email.com",
              },
              {
                label: "Telegram",
                value: "@your_telegram",
                href: "https://t.me/your_telegram",
              },
              {
                label: "GitHub",
                value: "github.com/username",
                href: "https://github.com/username",
              },
              {
                label: "LinkedIn",
                value: "linkedin.com/in/username",
                href: "https://linkedin.com/in/username",
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="card card-glow p-5 flex items-center justify-between group"
              >
                <div>
                  <div className="text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase mb-1">
                    {link.label}
                  </div>
                  <div className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {link.value}
                  </div>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--accent)]">&copy;</span> 2024 Никита Новиков
          </p>
          <p>
            Next.js + Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
}
