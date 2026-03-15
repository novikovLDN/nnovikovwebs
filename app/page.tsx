"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Typing animation hook ─── */
function useTyping(texts: string[], speed = 80, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplay(current.slice(0, charIndex + 1));
          if (charIndex + 1 === current.length) {
            setTimeout(() => setDeleting(true), pause);
          } else {
            setCharIndex(charIndex + 1);
          }
        } else {
          setDisplay(current.slice(0, charIndex));
          if (charIndex === 0) {
            setDeleting(false);
            setIndex((index + 1) % texts.length);
          } else {
            setCharIndex(charIndex - 1);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, index, texts, speed, pause]);

  return display;
}

/* ─── Scroll reveal hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll(".animate-on-scroll").forEach((child) =>
        observer.observe(child)
      );
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Nav ─── */
const NAV_ITEMS = [
  { href: "#about", label: "about" },
  { href: "#skills", label: "skills" },
  { href: "#projects", label: "projects" },
  { href: "#experience", label: "experience" },
  { href: "#contact", label: "contact" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0fdd] backdrop-blur-md border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
      style={{ animation: "slideDown 0.6s ease" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="text-[var(--green)] font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-[var(--text-muted)]">~/</span>devops
          <span className="inline-block w-[2px] h-[1.1em] bg-[var(--green)] ml-1 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors duration-300 relative group"
            >
              <span className="text-[var(--text-muted)] group-hover:text-[var(--green)] transition-colors duration-300">
                ./
              </span>
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[var(--green)] text-xl w-8 h-8 flex items-center justify-center"
          aria-label="Menu"
        >
          {mobileOpen ? "×" : "≡"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--bg-secondary)] border-b border-[var(--border)] px-6 pb-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors"
            >
              <span className="text-[var(--text-muted)]">$ </span>
              cd {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ─── Matrix rain background ─── */
function MatrixBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const chars = "01アイウエオカキクケコサシスセソ{}[]<>/\\|=+-_";
    const fontSize = 14;
    let columns: number;
    let drops: number[];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns)
        .fill(0)
        .map(() => Math.random() * -100);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 255, 65, 0.06)";
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i] += 0.4;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

/* ─── Section wrapper ─── */
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
      className={`relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ prompt, title }: { prompt: string; title: string }) {
  return (
    <div className="animate-on-scroll mb-12">
      <p className="text-xs text-[var(--text-muted)] mb-2 tracking-widest uppercase">
        {prompt}
      </p>
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--green)] text-glow">
        {title}
      </h2>
      <div className="mt-3 h-px bg-gradient-to-r from-[var(--green-dim)] via-[var(--border)] to-transparent" />
    </div>
  );
}

/* ─── Skills data ─── */
const SKILLS = [
  { name: "Docker", level: 95, icon: "🐳" },
  { name: "Kubernetes", level: 90, icon: "☸️" },
  { name: "Terraform", level: 88, icon: "🏗️" },
  { name: "AWS", level: 92, icon: "☁️" },
  { name: "CI/CD", level: 93, icon: "🔄" },
  { name: "Linux", level: 95, icon: "🐧" },
  { name: "Ansible", level: 85, icon: "📦" },
  { name: "Prometheus", level: 87, icon: "📊" },
  { name: "Python", level: 82, icon: "🐍" },
];

/* ─── Projects data ─── */
const PROJECTS = [
  {
    title: "K8s Cluster Autopilot",
    desc: "Автоматическое масштабирование и самовосстановление кластеров Kubernetes с кастомными операторами и мониторингом",
    tags: ["Kubernetes", "Go", "Prometheus", "Helm"],
  },
  {
    title: "CI/CD Pipeline Engine",
    desc: "Универсальный конвейер сборки и деплоя для микросервисной архитектуры с поддержкой canary-релизов",
    tags: ["GitLab CI", "ArgoCD", "Docker", "Terraform"],
  },
  {
    title: "Infra-as-Code Platform",
    desc: "Платформа управления облачной инфраструктурой через декларативные конфигурации с автоматическим drift detection",
    tags: ["Terraform", "AWS", "Ansible", "Python"],
  },
  {
    title: "Observability Stack",
    desc: "Полный стек мониторинга, логирования и трейсинга для распределённых систем с кастомными дашбордами",
    tags: ["Grafana", "Loki", "Tempo", "AlertManager"],
  },
];

/* ─── Experience data ─── */
const EXPERIENCE = [
  {
    period: "2022 — настоящее время",
    role: "Senior DevOps Engineer",
    company: "Tech Corp",
    desc: "Проектирование и поддержка облачной инфраструктуры, внедрение GitOps практик, оптимизация CI/CD пайплайнов",
  },
  {
    period: "2020 — 2022",
    role: "DevOps Engineer",
    company: "Cloud Solutions",
    desc: "Миграция on-premise инфраструктуры в AWS, настройка мониторинга и алертинга, автоматизация рутинных задач",
  },
  {
    period: "2018 — 2020",
    role: "System Administrator",
    company: "StartupXYZ",
    desc: "Администрирование Linux серверов, внедрение контейнеризации, настройка сетевой инфраструктуры",
  },
];

/* ─── Main Page ─── */
export default function Home() {
  const typed = useTyping(
    [
      "автоматизирую инфраструктуру",
      "строю CI/CD пайплайны",
      "оркеструю контейнеры",
      "мониторю всё и всех",
      "пишу Infrastructure as Code",
    ],
    70,
    1800
  );

  const heroRef = useScrollReveal();

  return (
    <div className="scanline-overlay crt-effect">
      <MatrixBg />
      <Nav />

      {/* ═══ HERO ═══ */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-4xl w-full">
          {/* Terminal window */}
          <div
            className="animate-on-scroll bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden"
            style={{ animation: "terminalBoot 0.8s ease" }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border)]">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-[var(--text-muted)]">
                terminal — devops@portfolio: ~
              </span>
            </div>

            {/* Terminal body */}
            <div className="p-6 md:p-10 space-y-4">
              <div className="flex items-start gap-3">
                {/* Photo placeholder */}
                <div className="hidden md:flex flex-shrink-0 w-28 h-28 rounded-lg border-2 border-[var(--green-dim)] items-center justify-center bg-[var(--bg-card)] overflow-hidden"
                  style={{ boxShadow: "0 0 20px rgba(0,255,65,0.1)" }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-1">👤</div>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ваше фото
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-muted)] mb-1">
                    <span className="text-[var(--green)]">guest@portfolio</span>
                    <span className="text-[var(--text-muted)]">:</span>
                    <span className="text-[var(--cyan)]">~</span>
                    <span className="text-[var(--text-muted)]">$</span>{" "}
                    <span className="text-[var(--text-secondary)]">cat intro.txt</span>
                  </p>

                  <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mt-3 leading-tight">
                    Привет, я{" "}
                    <span className="text-[var(--green)] text-glow-strong">
                      DevOps
                    </span>{" "}
                    инженер
                  </h1>

                  <div className="mt-4 text-base md:text-lg text-[var(--text-secondary)] flex items-center gap-1 flex-wrap">
                    <span className="text-[var(--green)]">{">"}</span>
                    <span>{typed}</span>
                    <span
                      className="inline-block w-[10px] h-[1.2em] bg-[var(--green)]"
                      style={{ animation: "blink 1s step-end infinite" }}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--green)] text-[var(--bg-primary)] font-semibold text-sm rounded hover:bg-[var(--green-dim)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                    >
                      <span>$</span> связаться
                    </a>
                    <a
                      href="#projects"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--green-dim)] text-[var(--green)] text-sm rounded hover:bg-[var(--green-glow)] transition-all duration-300"
                    >
                      <span>→</span> проекты
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-10 animate-on-scroll">
            <div
              className="text-[var(--text-muted)] text-xs flex flex-col items-center gap-2"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <span>scroll down</span>
              <span className="text-[var(--green)]">↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <Section id="about">
        <SectionTitle prompt="$ cat about.md" title="Обо мне" />

        <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
          {/* Photo */}
          <div className="animate-on-scroll stagger-1 flex justify-center md:justify-start">
            <div
              className="w-44 h-44 rounded-lg border-2 border-[var(--border)] flex items-center justify-center bg-[var(--bg-card)] overflow-hidden hover:border-[var(--green-dim)] transition-all duration-500"
              style={{ boxShadow: "0 0 30px rgba(0,255,65,0.05)" }}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">👤</div>
                <span className="text-xs text-[var(--text-muted)]">
                  your_photo.jpg
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="animate-on-scroll stagger-2 space-y-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--border-hover)] transition-colors duration-300">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <span className="text-[var(--green)]">/**</span>
                <br />
                <span className="text-[var(--text-primary)]">
                  DevOps инженер с опытом 5+ лет в построении и автоматизации
                  облачной инфраструктуры. Специализируюсь на Kubernetes,
                  CI/CD, Infrastructure as Code и observability.
                </span>
                <br />
                <br />
                Превращаю сложные инфраструктурные задачи в элегантные
                автоматизированные решения. Верю в GitOps, immutable
                infrastructure и culture of reliability.
                <br />
                <span className="text-[var(--green)]"> */</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { label: "Опыт", value: "5+ лет" },
                { label: "Облако", value: "AWS / GCP" },
                { label: "Uptime SLA", value: "99.95%" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`animate-on-scroll stagger-${i + 3} bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-center hover:border-[var(--green-dim)] transition-all duration-300`}
                >
                  <p className="text-[var(--green)] font-bold text-lg">
                    {stat.value}
                  </p>
                  <p className="text-[var(--text-muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ SKILLS ═══ */}
      <Section id="skills">
        <SectionTitle prompt="$ kubectl get skills" title="Технологии" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map((skill, i) => (
            <div
              key={skill.name}
              className={`animate-on-scroll stagger-${i + 1} group bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--green-dim)] transition-all duration-400 border-glow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{skill.icon}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--green)] transition-colors">
                    {skill.name}
                  </span>
                </div>
                <span className="text-xs text-[var(--green)] font-mono">
                  {skill.level}%
                </span>
              </div>

              <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--green-dim)] to-[var(--green)]"
                  style={{
                    width: `${skill.level}%`,
                    animation: "progressFill 1.5s ease forwards",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tools cloud */}
        <div className="animate-on-scroll mt-10 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5">
          <p className="text-xs text-[var(--text-muted)] mb-3">
            <span className="text-[var(--green)]">$</span> cat toolbox.txt
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Git", "GitHub Actions", "GitLab CI", "Jenkins",
              "ArgoCD", "Helm", "Istio", "Nginx",
              "PostgreSQL", "Redis", "RabbitMQ", "Kafka",
              "Grafana", "Loki", "Jaeger", "ELK Stack",
              "Vault", "Consul", "Packer", "Vagrant",
            ].map((tool) => (
              <span
                key={tool}
                className="px-2.5 py-1 text-xs border border-[var(--border)] rounded text-[var(--text-secondary)] hover:border-[var(--green-dim)] hover:text-[var(--green)] transition-all duration-300 cursor-default"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ PROJECTS ═══ */}
      <Section id="projects">
        <SectionTitle prompt="$ ls ~/projects" title="Проекты" />

        <div className="grid md:grid-cols-2 gap-5">
          {PROJECTS.map((project, i) => (
            <div
              key={project.title}
              className={`animate-on-scroll stagger-${i + 1} group bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--green-dim)] transition-all duration-400 border-glow cursor-pointer`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[var(--green)] text-xs">▸</span>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--green)] transition-colors">
                  {project.title}
                </h3>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                {project.desc}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-medium border border-[var(--green-dim)] text-[var(--green)] rounded-sm bg-[var(--green-glow)]"
                  >
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
        <SectionTitle prompt="$ git log --career" title="Опыт" />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-[var(--border)]">
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[var(--green-dim)] to-transparent" />
          </div>

          <div className="space-y-8">
            {EXPERIENCE.map((exp, i) => (
              <div
                key={exp.period}
                className={`animate-on-scroll stagger-${i + 1} relative pl-12 md:pl-16`}
              >
                {/* Dot */}
                <div className="absolute left-[11px] md:left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green-glow-strong)]" />

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--border-hover)] transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {exp.role}
                    </h3>
                    <span className="text-xs text-[var(--green)] font-mono">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--cyan)] mb-2">{exp.company}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CONTACT ═══ */}
      <Section id="contact">
        <SectionTitle prompt="$ ping me" title="Связаться" />

        <div className="animate-on-scroll bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
          {/* Terminal bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border)]">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-[var(--text-muted)]">
              contact — devops@portfolio
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-4 text-sm">
            <p className="text-[var(--text-muted)]">
              <span className="text-[var(--green)]">$</span> echo
              &quot;Открыт к интересным предложениям и проектам&quot;
            </p>

            <div className="space-y-3 mt-6">
              {[
                { label: "Email", value: "your@email.com", href: "mailto:your@email.com" },
                { label: "Telegram", value: "@your_telegram", href: "https://t.me/your_telegram" },
                { label: "GitHub", value: "github.com/username", href: "https://github.com/username" },
                { label: "LinkedIn", value: "linkedin.com/in/username", href: "https://linkedin.com/in/username" },
              ].map((link) => (
                <div key={link.label} className="flex items-center gap-3 group">
                  <span className="text-[var(--green)]">→</span>
                  <span className="text-[var(--text-muted)] w-20">{link.label}:</span>
                  <a
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--green)] transition-colors duration-300 underline underline-offset-4 decoration-[var(--border)] hover:decoration-[var(--green-dim)]"
                  >
                    {link.value}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <p className="text-[var(--text-muted)] text-xs">
                <span className="text-[var(--green)]">$</span> uptime
                <br />
                <span className="text-[var(--text-secondary)]">
                  Обычно отвечаю в течение 24 часов
                </span>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>
            <span className="text-[var(--green)]">©</span> 2024 — собрано с терминалом
          </p>
          <p>
            <span className="text-[var(--green)]">$</span> echo $STACK →{" "}
            <span className="text-[var(--text-secondary)]">
              Next.js + Tailwind
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
