"use client";

import { useEffect, useRef, useState } from "react";

/* ═══ HOOKS ═══ */

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
    if (el) el.querySelectorAll(".reveal").forEach((c) => observer.observe(c));
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

/* ═══ ICONS ═══ */

function ArrowIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

/* ═══ DATA ═══ */

const NAV = [
  { href: "#about", label: "Обо мне" },
  { href: "#skills", label: "Навыки" },
  { href: "#projects", label: "Проекты" },
  { href: "#experience", label: "Опыт" },
  { href: "#contact", label: "Контакт" },
] as const;

const SKILLS = [
  { title: "Облако и Инфраструктура", items: ["AWS", "GCP", "Terraform", "Ansible", "Packer"] },
  { title: "Контейнеризация", items: ["Docker", "Kubernetes", "Helm", "Istio", "ArgoCD"] },
  { title: "CI/CD и Автоматизация", items: ["GitLab CI", "GitHub Actions", "Jenkins", "Bash", "Python"] },
  { title: "Мониторинг", items: ["Prometheus", "Grafana", "Loki", "Jaeger", "ELK Stack"] },
] as const;

const PROJECTS = [
  { num: "01", title: "K8s Cluster Autopilot", desc: "Автоматическое масштабирование и самовосстановление кластеров Kubernetes с кастомными операторами", tags: ["Kubernetes", "Go", "Prometheus"], accent: true },
  { num: "02", title: "CI/CD Pipeline Engine", desc: "Универсальный конвейер для микросервисной архитектуры с canary-релизами и автоматическим откатом", tags: ["GitLab CI", "ArgoCD", "Docker"], accent: false },
  { num: "03", title: "Infra-as-Code Platform", desc: "Платформа управления облачной инфраструктурой с drift detection и policy enforcement", tags: ["Terraform", "AWS", "Python"], accent: false },
  { num: "04", title: "Observability Stack", desc: "Полный стек мониторинга, логирования и трейсинга с кастомными дашбордами и алертингом", tags: ["Grafana", "Loki", "Tempo"], accent: true },
] as const;

const EXPERIENCE = [
  { period: "2022 — н.в.", role: "Senior DevOps Engineer", company: "Tech Corp", desc: "Проектирование облачной инфраструктуры, внедрение GitOps, оптимизация CI/CD пайплайнов. Сокращение времени деплоя на 70%." },
  { period: "2020 — 2022", role: "DevOps Engineer", company: "Cloud Solutions", desc: "Миграция on-premise в AWS, настройка мониторинга и алертинга, автоматизация рутинных операций." },
  { period: "2018 — 2020", role: "System Administrator", company: "StartupXYZ", desc: "Администрирование Linux-серверов, внедрение контейнеризации, настройка сетевой инфраструктуры." },
] as const;

const STATS = [
  { value: "5+", label: "лет опыта" },
  { value: "99.9%", label: "uptime SLA" },
  { value: "50+", label: "проектов" },
  { value: "70%", label: "быстрее деплой" },
] as const;

const VALUES = [
  { title: "Автоматизация", desc: "Всё, что делается руками больше двух раз, должно быть автоматизировано" },
  { title: "Надёжность", desc: "Проектирование систем с учётом отказоустойчивости и быстрого восстановления" },
  { title: "Масштабируемость", desc: "Инфраструктура, которая растёт вместе с бизнесом без боли" },
] as const;

const CONTACTS = [
  { label: "Email", value: "your@email.com", href: "mailto:your@email.com" },
  { label: "Telegram", value: "@your_telegram", href: "https://t.me/your_telegram" },
  { label: "GitHub", value: "github.com/username", href: "https://github.com/username" },
  { label: "LinkedIn", value: "linkedin.com/in/username", href: "https://linkedin.com/in/username" },
] as const;

/* ═══ COMPONENTS ═══ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#080808ee] backdrop-blur-xl border-b border-[var(--border)]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <a href="#" className="font-display text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-[var(--accent)]">N</span>
          <span className="text-[var(--text-primary)]">.</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="px-4 py-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-300 tracking-wide">
              {item.label}
            </a>
          ))}
          <a href="#contact" className="ml-4 btn-primary !py-2.5 !px-6 !text-[12px]">Связаться</a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[var(--text-primary)] w-8 h-8 flex flex-col items-center justify-center gap-1.5" aria-label="Menu">
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[1.5px]" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-400 ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-[var(--bg-elevated)] border-t border-[var(--border)] px-6 py-4 space-y-1">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors border-b border-[var(--border)] last:border-0">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function AmbientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-[30%] -right-[20%] w-[60vw] h-[60vw] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-[20%] -left-[15%] w-[50vw] h-[50vw] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(var(--text-faint) 1px, transparent 1px), linear-gradient(90deg, var(--text-faint) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
    </div>
  );
}

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <section id={id} ref={ref} className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ label, title, secondary }: { label: string; title: string; secondary: string }) {
  return (
    <>
      <div className="reveal flex items-center gap-3 mb-4">
        <div className="accent-dot" />
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">{label}</span>
      </div>
      <h2 className="reveal font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-14">
        {title}<br />
        <span className="text-[var(--text-secondary)]">{secondary}</span>
      </h2>
    </>
  );
}

/* ═══ PAGE ═══ */

export default function Home() {
  const typed = useTyping(["строю облачную инфраструктуру", "автоматизирую CI/CD пайплайны", "оркеструю контейнеры", "проектирую отказоустойчивые системы"], 65, 2000);
  const heroRef = useScrollReveal();

  return (
    <div className="grain">
      <AmbientBg />
      <Nav />

      {/* HERO */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center px-6 lg:px-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-16 items-center">
          <div>
            <div className="reveal flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" />
              <span className="text-[12px] tracking-[0.2em] uppercase text-[var(--text-secondary)] font-medium">DevOps Engineer</span>
            </div>

            <h1 className="reveal font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              <span className="text-[var(--text-primary)]">Никита</span><br />
              <span className="gradient-text">Новиков</span>
            </h1>

            <div className="reveal mt-8 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl">
              <span>{typed}</span>
              <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-1 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
            </div>

            <div className="reveal mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary">
                Связаться
                <ArrowIcon size={14} />
              </a>
              <a href="#projects" className="btn-secondary">Проекты</a>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="w-72 h-72 relative">
              <div className="absolute inset-0 rounded-full border border-[var(--border)]" style={{ animation: "pulse-glow 4s ease-in-out infinite" }} />
              <div className="absolute inset-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <div className="text-center">
                  <div className="font-display text-5xl font-bold gradient-text">5+</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 tracking-wider uppercase">лет опыта</div>
                </div>
              </div>
              {["top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"].map((pos) => (
                <div key={pos} className={`absolute ${pos} accent-dot`} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]" style={{ animation: "float 3s ease-in-out infinite" }}>
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[var(--text-muted)] to-transparent" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-[var(--accent)]">{s.value}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-1 tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <Section id="about">
        <SectionHeader label="Обо мне" title="Создаю надёжную" secondary="инфраструктуру" />
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-lg">
              DevOps инженер с опытом 5+ лет. Специализируюсь на построении и автоматизации облачной инфраструктуры, Kubernetes, CI/CD и observability.
            </p>
            <p className="reveal mt-4 text-[var(--text-secondary)] leading-relaxed max-w-lg">
              Превращаю сложные инфраструктурные задачи в элегантные автоматизированные решения. GitOps, immutable infrastructure, culture of reliability.
            </p>
          </div>
          <div className="grid gap-4">
            {VALUES.map((item, i) => (
              <div key={item.title} className={`reveal stagger-${i + 1} card card-glow p-6`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="accent-dot" />
                  <h3 className="font-semibold text-[var(--text-primary)]">{item.title}</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SKILLS */}
      <Section id="skills">
        <SectionHeader label="Навыки" title="Технологии и" secondary="инструменты" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS.map((cat, i) => (
            <div key={cat.title} className={`reveal stagger-${i + 1}`}>
              <h3 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">{cat.title}</h3>
              <div className="space-y-2">
                {cat.items.map((skill) => (
                  <div key={skill} className="group flex items-center gap-3 py-2.5 px-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PROJECTS */}
      <Section id="projects">
        <SectionHeader label="Проекты" title="Избранные" secondary="работы" />
        <div className="grid md:grid-cols-2 gap-6">
          {PROJECTS.map((p, i) => (
            <div key={p.num} className={`reveal stagger-${i + 1} card card-glow p-7 group cursor-pointer ${p.accent ? "border-[var(--border-accent)]" : ""}`}>
              <div className="flex items-start justify-between mb-5">
                <span className="font-display text-4xl font-bold text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors duration-500">{p.num}</span>
                <ArrowUpRightIcon className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">{p.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* EXPERIENCE */}
      <Section id="experience">
        <SectionHeader label="Опыт" title="Карьерный" secondary="путь" />
        <div className="space-y-6">
          {EXPERIENCE.map((exp, i) => (
            <div key={exp.period} className={`reveal stagger-${i + 1} card p-7`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="accent-dot" />
                    <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                  </div>
                  <p className="text-sm text-[var(--accent)] mb-3 ml-5">{exp.company}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed ml-5">{exp.desc}</p>
                </div>
                <span className="text-[12px] tracking-wider text-[var(--text-muted)] uppercase whitespace-nowrap font-medium md:mt-1">{exp.period}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <SectionHeader label="Контакт" title="Давайте" secondary="работать вместе" />
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-md">
              Открыт к интересным предложениям и проектам. Обычно отвечаю в течение 24 часов.
            </p>
          </div>
          <div className="reveal space-y-4">
            {CONTACTS.map((link) => (
              <a key={link.label} href={link.href} className="card card-glow p-5 flex items-center justify-between group">
                <div>
                  <div className="text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase mb-1">{link.label}</div>
                  <div className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{link.value}</div>
                </div>
                <ArrowIcon className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--text-muted)]">
          <p><span className="text-[var(--accent)]">&copy;</span> 2024 Никита Новиков</p>
          <p>Next.js + Tailwind</p>
        </div>
      </footer>
    </div>
  );
}
