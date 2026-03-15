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

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let current = window.scrollY;
    let target = window.scrollY;
    let rafId: number;
    let running = true;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target = Math.max(0, Math.min(target + e.deltaY, document.body.scrollHeight - window.innerHeight));
    };

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") { target = 0; e.preventDefault(); return; }
      const el = document.querySelector(href);
      if (el) { target = el.getBoundingClientRect().top + window.scrollY - 80; e.preventDefault(); }
    };

    const animate = () => {
      if (!running) return;
      const diff = target - current;
      if (Math.abs(diff) > 0.5) {
        current += diff * 0.08;
        window.scrollTo(0, current);
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    document.addEventListener("click", onClick);
    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
    };
  }, []);
}

/* ═══════════════════════════════════════════════════
   CUSTOM CURSOR (safe: body class only when active)
   ═══════════════════════════════════════════════════ */

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest("a, button, [role='button'], .card, .tag, input, textarea");
      hovering.current = isInteractive;
      dotRef.current?.classList.toggle("hovering", isInteractive);
      ringRef.current?.classList.toggle("hovering", isInteractive);
    };

    let rafId: number;
    let running = true;
    const animate = () => {
      if (!running) return;
      dotPos.current.x += (mouse.current.x - dotPos.current.x) * 0.18;
      dotPos.current.y += (mouse.current.y - dotPos.current.y) * 0.18;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.08;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.08;

      if (dotRef.current) {
        const dw = hovering.current ? 7 : 4;
        dotRef.current.style.transform = `translate3d(${dotPos.current.x - dw}px, ${dotPos.current.y - dw}px, 0)`;
      }
      if (ringRef.current) {
        const rw = hovering.current ? 30 : 20;
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - rw}px, ${ringPos.current.y - rw}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   CLICK RIPPLES
   ═══════════════════════════════════════════════════ */

function ClickRipples() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onClick = (e: MouseEvent) => {
      const id = ++idRef.current;
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return <>{ripples.map((r) => <div key={r.id} className="click-ripple" style={{ left: r.x, top: r.y }} />)}</>;
}

/* ═══════════════════════════════════════════════════
   ANIMATED BACKGROUND
   ═══════════════════════════════════════════════════ */

const ORBS = [
  { size: "55vw", x: "-15%", y: "-25%", opacity: 0.035, anim: "orbFloat1 25s ease-in-out infinite", color: "var(--accent)" },
  { size: "45vw", x: "60%", y: "20%", opacity: 0.025, anim: "orbFloat2 30s ease-in-out infinite", color: "#00ccff" },
  { size: "40vw", x: "10%", y: "65%", opacity: 0.02, anim: "orbFloat3 22s ease-in-out infinite", color: "var(--accent)" },
  { size: "30vw", x: "75%", y: "70%", opacity: 0.018, anim: "orbFloat1 28s ease-in-out infinite reverse", color: "#00ccff" },
] as const;

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            opacity: orb.opacity,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
            animation: orb.anim,
            filter: "blur(40px)",
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(var(--text-faint) 1px, transparent 1px), linear-gradient(90deg, var(--text-faint) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const init = () => {
      resize();
      particles.length = 0;
      const count = Math.min(Math.floor((w * h) / 30000), 50);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.25 + 0.05,
        });
      }
    };

    init();
    window.addEventListener("resize", resize);

    let rafId: number;
    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 106, ${p.a})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => { running = false; cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════ */

function ArrowIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const NAV = [
  { href: "#about", label: "Обо мне" },
  { href: "#services", label: "Услуги" },
  { href: "#skills", label: "Навыки" },
  { href: "#projects", label: "Проекты" },
  { href: "#experience", label: "Опыт" },
  { href: "#contact", label: "Контакт" },
] as const;

const SERVICES = [
  { title: "Облачная инфраструктура", desc: "Проектирование и развёртывание отказоустойчивой инфраструктуры на AWS, GCP, Azure. Миграция on-premise в облако с нулевым downtime.", icon: "☁️" },
  { title: "CI/CD Пайплайны", desc: "Построение автоматизированных конвейеров сборки, тестирования и деплоя. Canary-релизы, blue-green, автоматический откат.", icon: "🔄" },
  { title: "Kubernetes и Контейнеризация", desc: "Настройка и управление кластерами K8s. Helm-чарты, операторы, service mesh, автоскейлинг.", icon: "⚙️" },
  { title: "Мониторинг и Observability", desc: "Полный стек: метрики, логи, трейсы. Кастомные дашборды, алертинг, SLI/SLO, инцидент-менеджмент.", icon: "📊" },
  { title: "Infrastructure as Code", desc: "Terraform, Ansible, Packer. Декларативное управление инфраструктурой с drift detection и policy enforcement.", icon: "📝" },
  { title: "DevSecOps", desc: "Интеграция безопасности в CI/CD: SAST/DAST, сканирование образов, секрет-менеджмент через Vault.", icon: "🔒" },
] as const;

const SKILLS = [
  { title: "Облако", items: ["AWS", "GCP", "Terraform", "Ansible", "Packer"] },
  { title: "Контейнеризация", items: ["Docker", "Kubernetes", "Helm", "Istio", "ArgoCD"] },
  { title: "CI/CD", items: ["GitLab CI", "GitHub Actions", "Jenkins", "Bash", "Python"] },
  { title: "Мониторинг", items: ["Prometheus", "Grafana", "Loki", "Jaeger", "ELK Stack"] },
] as const;

const PROJECTS = [
  { num: "01", title: "K8s Cluster Autopilot", desc: "Автоматическое масштабирование и самовосстановление кластеров Kubernetes с кастомными операторами и предиктивным автоскейлингом. Снизили расходы на инфраструктуру на 35%.", tags: ["Kubernetes", "Go", "Prometheus"], accent: true },
  { num: "02", title: "CI/CD Pipeline Engine", desc: "Универсальный конвейер для 40+ микросервисов с canary-релизами, автооткатом и security-проверками. Время деплоя: 45 мин → 8 мин.", tags: ["GitLab CI", "ArgoCD", "Docker"], accent: false },
  { num: "03", title: "Infra-as-Code Platform", desc: "Self-service платформа для разработчиков: заказ инфраструктуры через UI. Drift detection, policy enforcement, автоматический аудит.", tags: ["Terraform", "AWS", "Python"], accent: false },
  { num: "04", title: "Observability Stack", desc: "Единый стек мониторинга для 200+ сервисов: метрики, логи, трейсы. ML-детекция аномалий сократила MTTR на 60%.", tags: ["Grafana", "Loki", "Tempo"], accent: true },
] as const;

const EXPERIENCE = [
  { period: "2022 — н.в.", role: "Senior DevOps Engineer", company: "Tech Corp", desc: "Проектирование облачной инфраструктуры на AWS/GCP для продуктов с 1M+ пользователей. Внедрение GitOps через ArgoCD, оптимизация CI/CD — деплой с 45 до 8 минут. Управление кластером 200+ нод, SLA 99.95%." },
  { period: "2020 — 2022", role: "DevOps Engineer", company: "Cloud Solutions", desc: "Миграция 50+ сервисов из on-premise в AWS без downtime. Построение observability-стека (Prometheus + Grafana + Loki). Автоматизация снизила число инцидентов на 60%." },
  { period: "2018 — 2020", role: "System Administrator", company: "StartupXYZ", desc: "Администрирование 100+ Linux-серверов. Внедрение Docker и Kubernetes с нуля. Настройка сетевой инфраструктуры, VPN, бэкапов." },
] as const;

const STATS = [
  { value: "5+", label: "лет опыта" },
  { value: "99.95%", label: "uptime SLA" },
  { value: "50+", label: "проектов" },
  { value: "200+", label: "нод K8s" },
] as const;

const VALUES = [
  { title: "Автоматизация", desc: "Всё, что делается руками больше двух раз, должно быть автоматизировано. Zero-touch deployments." },
  { title: "Надёжность", desc: "Проектирование систем с учётом отказоустойчивости, chaos engineering и быстрого восстановления." },
  { title: "Масштабируемость", desc: "Инфраструктура, которая растёт с бизнесом — от 10 до 10 000 rps без боли." },
] as const;

const CONTACTS = [
  { label: "Email", value: "your@email.com", href: "mailto:your@email.com" },
  { label: "Telegram", value: "@your_telegram", href: "https://t.me/your_telegram" },
  { label: "GitHub", value: "github.com/username", href: "https://github.com/username" },
  { label: "LinkedIn", value: "linkedin.com/in/username", href: "https://linkedin.com/in/username" },
] as const;

const HERO_SOCIALS = [
  { label: "GitHub", short: "GH", href: "https://github.com/username" },
  { label: "Telegram", short: "TG", href: "https://t.me/your_telegram" },
  { label: "LinkedIn", short: "LI", href: "https://linkedin.com/in/username" },
] as const;

/* ═══════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = NAV.map((n) => n.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) { setActive(sections[i]); return; }
      }
      setActive("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled ? "bg-[#080808ee] backdrop-blur-2xl border-b border-[var(--border)]" : "bg-transparent"}`} role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
        <a href="#" className="font-display text-xl font-bold tracking-tight hover:opacity-80 transition-opacity" aria-label="На главную">
          <span className="text-[var(--accent)]">M</span><span className="text-[var(--text-primary)]">.</span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={`px-3 xl:px-4 py-2 text-[13px] transition-colors duration-300 tracking-wide relative ${active === item.href.slice(1) ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
              {item.label}
              {active === item.href.slice(1) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />}
            </a>
          ))}
          <a href="#contact" className="ml-3 btn-primary !py-2.5 !px-6 !text-[12px]">Обсудить проект</a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[var(--text-primary)] w-10 h-10 flex flex-col items-center justify-center gap-1.5" aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={mobileOpen}>
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[1.5px]" : ""}`} />
        </button>
      </div>

      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-[var(--bg-elevated)] border-t border-[var(--border)] px-5 sm:px-6 py-4 space-y-1">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block py-3.5 text-sm transition-colors border-b border-[var(--border)] last:border-0 ${active === item.href.slice(1) ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.innerWidth < 768) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
  }, []);

  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      {children}
    </div>
  );
}

function Section({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <section id={id} ref={ref} className={`relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-20 sm:py-24 md:py-32 ${className}`}>
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
      <h2 className="reveal font-display text-[clamp(1.75rem,5vw,3rem)] font-bold tracking-tight mb-10 sm:mb-14">
        {title}<br /><span className="text-[var(--text-secondary)]">{secondary}</span>
      </h2>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const typed = useTyping(["строю облачную инфраструктуру", "автоматизирую CI/CD пайплайны", "оркеструю контейнеры", "проектирую отказоустойчивые системы"], 65, 2000);
  const heroRef = useScrollReveal();
  useSmoothScroll();

  return (
    <div className="grain">
      <CustomCursor />
      <ClickRipples />
      <AnimatedBackground />
      <ParticleField />
      <Nav />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative z-10 min-h-[100svh] flex items-center px-5 sm:px-6 lg:px-10 pt-20 pb-24">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
          <div>
            <div className="reveal flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              <span className="text-[11px] sm:text-[12px] tracking-[0.2em] uppercase text-[var(--text-secondary)] font-medium">DevOps Engineer</span>
            </div>

            <h1 className="reveal font-display text-[clamp(2.5rem,8vw,6rem)] font-bold tracking-tight leading-[0.95]">
              <span className="text-[var(--text-primary)]">Максим</span><br />
              <span className="gradient-text">Новиков</span>
            </h1>

            <div className="reveal mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-xl min-h-[2em] sm:min-h-[1.7em]">
              <span>{typed}</span>
              <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-1 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
            </div>

            <div className="reveal mt-8 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
              <a href="#contact" className="btn-primary">Обсудить проект <ArrowIcon size={14} /></a>
              <a href="#projects" className="btn-secondary">Смотреть проекты</a>
            </div>

            <div className="reveal mt-10 sm:mt-12 flex items-center gap-5 sm:gap-6">
              {HERO_SOCIALS.map((s) => (
                <a key={s.short} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-[11px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300">
                  {s.short}
                </a>
              ))}
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
            </div>
          </div>

          {/* Decoration */}
          <div className="hidden lg:block relative" aria-hidden="true">
            <div className="w-72 xl:w-80 h-72 xl:h-80 relative" style={{ animation: "float 6s ease-in-out infinite" }}>
              <div className="absolute inset-0 rounded-full border border-[var(--border)]" style={{ animation: "pulse-glow 4s ease-in-out infinite" }} />
              <div className="absolute inset-4 rounded-full border border-[var(--border)] opacity-50" />
              <div className="absolute inset-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <div className="text-center">
                  <div className="font-display text-4xl xl:text-5xl font-bold gradient-text">5+</div>
                  <div className="text-[10px] xl:text-[11px] text-[var(--text-muted)] mt-2 tracking-wider uppercase">лет опыта</div>
                </div>
              </div>
              {[
                "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
              ].map((pos, i) => (
                <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full bg-[var(--accent)]`} style={{ animation: "pulse-glow 3s ease-in-out infinite", animationDelay: `${i}s` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]" style={{ animation: "float 3s ease-in-out infinite" }}>
            <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-[var(--border)] flex items-start justify-center pt-1.5">
              <div className="w-[2px] h-2 rounded-full bg-[var(--accent)] opacity-70" style={{ animation: "float 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="relative z-10 border-y border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="glow-line absolute top-0 left-0 w-full h-[1px]" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-8 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center group" style={{ animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--accent)] group-hover:scale-110 transition-transform duration-300">{s.value}</div>
              <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)] mt-1.5 sm:mt-2 tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ABOUT ═══ */}
      <Section id="about">
        <SectionHeader label="Обо мне" title="Создаю надёжную" secondary="инфраструктуру" />
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-lg text-base sm:text-lg">
              DevOps инженер с опытом 5+ лет в продуктовых компаниях. Специализируюсь на построении и автоматизации облачной инфраструктуры, Kubernetes, CI/CD и observability для highload-проектов.
            </p>
            <p className="reveal mt-4 sm:mt-5 text-[var(--text-secondary)] leading-relaxed max-w-lg text-sm sm:text-base">
              Превращаю сложные инфраструктурные задачи в элегантные автоматизированные решения. GitOps, immutable infrastructure, culture of reliability — не просто модные слова, а ежедневная практика, которая помогает командам двигаться быстрее и спать спокойнее.
            </p>
            <div className="reveal mt-6 sm:mt-8 h-[1px] bg-gradient-to-r from-[var(--border-accent)] via-[var(--border)] to-transparent" />
          </div>
          <div className="grid gap-3 sm:gap-4">
            {VALUES.map((item, i) => (
              <TiltCard key={item.title} className={`reveal stagger-${i + 1}`}>
                <div className="card card-glow p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <div className="accent-dot" />
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">{item.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SERVICES ═══ */}
      <Section id="services">
        <SectionHeader label="Услуги" title="Чем могу" secondary="помочь" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((s, i) => (
            <TiltCard key={s.title} className={`reveal stagger-${Math.min(i + 1, 5)}`}>
              <div className="card card-glow p-5 sm:p-7 h-full">
                <div className="text-2xl sm:text-3xl mb-4">{s.icon}</div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">{s.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      {/* ═══ CTA BANNER ═══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-10 sm:py-16">
        <div className="card p-8 sm:p-12 lg:p-16 text-center border-[var(--border-accent)]" style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, #0f1a0f 100%)" }}>
          <h3 className="font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-4">
            Нужна надёжная <span className="gradient-text">инфраструктура?</span>
          </h3>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mx-auto mb-8">
            Расскажите о вашем проекте — предложу оптимальное решение по архитектуре, стеку и автоматизации. Первая консультация бесплатна.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a href="#contact" className="btn-primary">Обсудить проект <ArrowIcon size={14} /></a>
            <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="btn-secondary">Написать в Telegram</a>
          </div>
        </div>
      </div>

      {/* ═══ SKILLS ═══ */}
      <Section id="skills">
        <SectionHeader label="Навыки" title="Технологии и" secondary="инструменты" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {SKILLS.map((cat, i) => (
            <div key={cat.title} className={`reveal stagger-${i + 1}`}>
              <h3 className="text-[11px] sm:text-[12px] font-semibold tracking-[0.12em] sm:tracking-[0.15em] uppercase text-[var(--text-muted)] mb-3 sm:mb-5">{cat.title}</h3>
              <div className="space-y-2">
                {cat.items.map((skill) => (
                  <div key={skill} className="group flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 cursor-default">
                    <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[var(--accent)] scale-0 group-hover:scale-100 transition-transform duration-300" />
                    <span className="text-xs sm:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ PROJECTS ═══ */}
      <Section id="projects">
        <SectionHeader label="Проекты" title="Избранные" secondary="кейсы" />
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {PROJECTS.map((p, i) => (
            <TiltCard key={p.num} className={`reveal stagger-${i + 1}`}>
              <div className={`card card-glow p-5 sm:p-8 group h-full ${p.accent ? "border-[var(--border-accent)]" : ""}`}>
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <span className="font-display text-3xl sm:text-5xl font-bold text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors duration-500">{p.num}</span>
                  <ArrowUpRightIcon className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-[var(--text-primary)] mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4 sm:mb-6">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      {/* ═══ EXPERIENCE ═══ */}
      <Section id="experience">
        <SectionHeader label="Опыт" title="Карьерный" secondary="путь" />
        <div className="relative">
          <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--accent-muted)] via-[var(--border)] to-transparent hidden md:block" aria-hidden="true" />
          <div className="space-y-5 sm:space-y-8">
            {EXPERIENCE.map((exp, i) => (
              <div key={exp.period} className={`reveal stagger-${i + 1} md:pl-10 relative`}>
                <div className="hidden md:block absolute left-[7px] top-7 sm:top-8 w-[9px] h-[9px] rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" aria-hidden="true" />
                <TiltCard>
                  <div className="card p-5 sm:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg sm:text-xl font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                        <p className="text-xs sm:text-sm text-[var(--accent)] mt-1 mb-2 sm:mb-3">{exp.company}</p>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{exp.desc}</p>
                      </div>
                      <span className="text-[11px] sm:text-[12px] tracking-wider text-[var(--text-muted)] uppercase whitespace-nowrap font-medium md:mt-1 shrink-0">{exp.period}</span>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ CONTACT ═══ */}
      <Section id="contact">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <SectionHeader label="Контакт" title="Давайте" secondary="работать вместе" />
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-md text-base sm:text-lg">
              Открыт к интересным предложениям и проектам. Расскажите о задаче — обсудим, как я могу помочь.
            </p>
            <div className="reveal mt-6 flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              Обычно отвечаю в течение 24 часов
            </div>
          </div>
          <div className="reveal space-y-3 sm:space-y-4">
            {CONTACTS.map((link) => (
              <TiltCard key={link.label}>
                <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="card card-glow p-4 sm:p-5 flex items-center justify-between group">
                  <div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase mb-1 sm:mb-1.5">{link.label}</div>
                    <div className="text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300">{link.value}</div>
                  </div>
                  <ArrowIcon className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="glow-line absolute top-0 left-0 w-full h-[1px]" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 py-10 sm:py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">
            <div>
              <span className="font-display text-2xl font-bold">
                <span className="text-[var(--accent)]">M</span><span className="text-[var(--text-primary)]">.</span>
              </span>
              <p className="mt-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
                DevOps инженер, создающий надёжную и масштабируемую инфраструктуру для современных продуктов.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">Навигация</h4>
              <div className="space-y-2.5">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="block text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">Контакты</h4>
              <div className="space-y-2.5">
                {CONTACTS.slice(0, 3).map((c) => (
                  <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{c.value}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[1px] bg-[var(--border)] mb-6 sm:mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] sm:text-[12px] text-[var(--text-muted)]">
            <p><span className="text-[var(--accent)]">&copy;</span> {new Date().getFullYear()} Максим Новиков</p>
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              Next.js + Tailwind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
