"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, ArrowUpRight, Cloud, RefreshCw, Settings, BarChart3, FileCode, ShieldCheck, Github, Send, Linkedin, Mail, ChevronDown, Menu, X, Quote, Award } from "lucide-react";

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

function useSmoothAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href === "#") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const ripples: { x: number; y: number; start: number; duration: number }[] = [];
    let animating = false;
    let rafId: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const t = (now - r.start) / r.duration;
        if (t >= 1) { ripples.splice(i, 1); continue; }

        const eased = 1 - Math.pow(1 - t, 3);
        const radius = eased * 120;
        const alpha = (1 - eased) * 0.45;

        const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius);
        gradient.addColorStop(0, `rgba(0, 255, 106, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(0, 255, 106, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(0, 255, 106, 0)`);

        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      if (ripples.length > 0) {
        rafId = requestAnimationFrame(draw);
      } else {
        animating = false;
      }
    };

    const startAnim = () => {
      if (!animating) {
        animating = true;
        rafId = requestAnimationFrame(draw);
      }
    };

    const onClick = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const y = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      ripples.push({ x, y, start: performance.now(), duration: 700 });
      startAnim();
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("touchstart", onClick, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("touchstart", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[99997]" aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════
   ANIMATED BACKGROUND
   ═══════════════════════════════════════════════════ */

const ORBS = [
  { size: "55vw", x: "-15%", y: "-25%", opacity: 0.07, anim: "orbFloat1 25s ease-in-out infinite", color: "var(--accent)" },
  { size: "45vw", x: "60%", y: "20%", opacity: 0.05, anim: "orbFloat2 30s ease-in-out infinite", color: "#00ccff" },
  { size: "40vw", x: "10%", y: "65%", opacity: 0.04, anim: "orbFloat3 22s ease-in-out infinite", color: "var(--accent)" },
  { size: "30vw", x: "75%", y: "70%", opacity: 0.035, anim: "orbFloat1 28s ease-in-out infinite reverse", color: "#00ccff" },
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
        className="absolute inset-0 opacity-[0.035]"
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
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const init = () => {
      resize();
      particles.length = 0;
      const count = Math.min(Math.floor((w * h) / 50000), 30);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
          r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.2 + 0.05,
        });
      }
    };

    init();
    window.addEventListener("resize", init);

    let rafId: number;
    let running = true;
    let lastTime = 0;
    const draw = (now: number) => {
      if (!running) return;
      rafId = requestAnimationFrame(draw);
      if (now - lastTime < 33) return; // cap at ~30fps
      lastTime = now;
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
    };

    rafId = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(rafId); window.removeEventListener("resize", init); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" style={{ willChange: "auto" }} aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════
   SERVICE ICON MAP
   ═══════════════════════════════════════════════════ */

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  cloud: <Cloud size={28} />,
  cicd: <RefreshCw size={28} />,
  k8s: <Settings size={28} />,
  monitoring: <BarChart3 size={28} />,
  iac: <FileCode size={28} />,
  devsecops: <ShieldCheck size={28} />,
};

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
  { title: "Облачная инфраструктура", desc: "Проектирование и развёртывание отказоустойчивой инфраструктуры на AWS, GCP, Azure. Миграция on-premise в облако с нулевым downtime.", icon: "cloud" },
  { title: "CI/CD Пайплайны", desc: "Построение автоматизированных конвейеров сборки, тестирования и деплоя. Canary-релизы, blue-green, автоматический откат.", icon: "cicd" },
  { title: "Kubernetes и Контейнеризация", desc: "Настройка и управление кластерами K8s. Helm-чарты, операторы, service mesh, автоскейлинг.", icon: "k8s" },
  { title: "Мониторинг и Observability", desc: "Полный стек: метрики, логи, трейсы. Кастомные дашборды, алертинг, SLI/SLO, инцидент-менеджмент.", icon: "monitoring" },
  { title: "Infrastructure as Code", desc: "Terraform, Ansible, Packer. Декларативное управление инфраструктурой с drift detection и policy enforcement.", icon: "iac" },
  { title: "DevSecOps", desc: "Интеграция безопасности в CI/CD: SAST/DAST, сканирование образов, секрет-менеджмент через Vault.", icon: "devsecops" },
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
  { label: "GitHub", icon: "github", href: "https://github.com/username" },
  { label: "Telegram", icon: "telegram", href: "https://t.me/your_telegram" },
  { label: "LinkedIn", icon: "linkedin", href: "https://linkedin.com/in/username" },
] as const;

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  telegram: <Send size={18} />,
  linkedin: <Linkedin size={18} />,
};

const TESTIMONIALS = [
  { text: "Максим перестроил наш CI/CD пайплайн с нуля — время деплоя упало в 5 раз, а количество инцидентов снизилось на 60%. Лучший DevOps-инженер, с которым мы работали.", author: "Алексей К.", role: "CTO, Cloud Solutions" },
  { text: "Благодаря миграции в облако, которую провёл Максим, мы сократили расходы на инфраструктуру на 40% и получили автоскейлинг, о котором раньше только мечтали.", author: "Дмитрий В.", role: "VP of Engineering, Tech Corp" },
  { text: "Профессионализм и глубина знаний. Максим не просто настраивает инструменты — он проектирует системы, которые работают годами без вмешательства.", author: "Мария С.", role: "Lead Developer, StartupXYZ" },
] as const;

const CERTIFICATIONS = [
  { name: "AWS Solutions Architect", issuer: "Amazon Web Services", year: "2023" },
  { name: "Certified Kubernetes Administrator", issuer: "CNCF", year: "2022" },
  { name: "Terraform Associate", issuer: "HashiCorp", year: "2023" },
  { name: "Docker Certified Associate", issuer: "Docker", year: "2021" },
] as const;

/* ═══════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const lastScrollY = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      if (y > 100) {
        const scrollingDown = y > lastScrollY.current && y - lastScrollY.current > 5;
        const scrollingUp = y < lastScrollY.current && lastScrollY.current - y > 5;

        if (scrollingDown) {
          // Hide immediately on scroll down
          if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
          setHidden(true);
        } else if (scrollingUp) {
          // Show after 60ms delay on scroll up
          if (!showTimer.current) {
            showTimer.current = setTimeout(() => {
              setHidden(false);
              showTimer.current = null;
            }, 60);
          }
        }
      } else {
        if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
        setHidden(false);
      }
      lastScrollY.current = y;

      const sections = NAV.map((n) => n.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 150) { setActive(sections[i]); return; }
      }
      setActive("");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (showTimer.current) clearTimeout(showTimer.current);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${scrolled && !mobileOpen ? "backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]" : ""}`}
      style={{
        background: mobileOpen ? "transparent" : scrolled ? "rgba(8, 8, 8, 0.35)" : "transparent",
        transform: hidden && !mobileOpen ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.6s ease, backdrop-filter 0.6s ease",
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto py-4 flex items-center justify-between relative z-50" style={{ padding: "16px clamp(20px, 5vw, 40px)" }}>
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
          <a href="#contact" className="ml-3 btn-primary !py-2.5 !px-6 !text-[12px] !w-auto !rounded-full">Обсудить проект</a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[var(--text-primary)] w-10 h-10 flex flex-col items-center justify-center gap-1.5" aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={mobileOpen}>
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[1.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile fullscreen menu */}
      <div
        className="lg:hidden fixed inset-0 z-40"
        style={{
          pointerEvents: mobileOpen ? "auto" : "none",
          opacity: mobileOpen ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(8, 8, 8, 0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
        <div className="relative flex flex-col justify-center items-center h-full" style={{ paddingBottom: "60px" }}>
          <div className="flex flex-col items-center" style={{ gap: "8px" }}>
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-center text-2xl font-display font-semibold tracking-tight ${active === item.href.slice(1) ? "text-[var(--accent)]" : "text-[var(--text-primary)] hover:text-[var(--accent)]"}`}
                style={{
                  padding: "10px 24px",
                  transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
                  opacity: mobileOpen ? 1 : 0,
                  transition: `transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.05}s, opacity 0.4s ease ${i * 0.05}s, color 0.3s ease`,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div style={{
            marginTop: "32px",
            transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
            opacity: mobileOpen ? 1 : 0,
            transition: `transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${NAV.length * 0.05}s, opacity 0.4s ease ${NAV.length * 0.05}s`,
          }}>
            <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-primary !w-auto !px-10">Обсудить проект</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileDivider() {
  return <div className="mobile-divider hidden max-[768px]:block" aria-hidden="true" />;
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
    <section id={id} ref={ref} style={{ padding: "clamp(48px, 8vw, 120px) clamp(20px, 5vw, 64px)" }} className={`relative z-10 max-w-[1400px] 2xl:max-w-[1600px] mx-auto ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({ label, title, secondary }: { label: string; title: string; secondary: string }) {
  return (
    <div className="mb-10 sm:mb-14">
      <div className="reveal flex items-center gap-3 mb-5">
        <div className="accent-dot" />
        <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">{label}</span>
      </div>
      <h2 className="reveal font-display text-[clamp(1.75rem,5vw,3rem)] font-bold tracking-tight">
        {title}<br /><span className="text-[var(--text-secondary)]">{secondary}</span>
      </h2>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const typed = useTyping(["строю облачную инфраструктуру", "автоматизирую CI/CD пайплайны", "оркеструю контейнеры", "проектирую отказоустойчивые системы"], 65, 2000);
  const heroRef = useScrollReveal();
  useSmoothAnchors();

  return (
    <div className="grain">
      <CustomCursor />
      <ClickRipples />
      <AnimatedBackground />
      <ParticleField />
      <Nav />
      <main>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative z-10 min-h-[100svh] flex items-center" style={{ padding: "clamp(80px, 10vw, 160px) clamp(20px, 5vw, 64px) clamp(80px, 10vw, 160px)" }}>
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
          <div>
            <div className="reveal flex items-center gap-3" style={{ marginBottom: "clamp(24px, 4vw, 32px)" }}>
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              <span className="text-[12px] tracking-[0.2em] uppercase text-[var(--text-secondary)] font-medium">DevOps Engineer</span>
            </div>

            <h1 className="reveal font-display font-bold tracking-tight leading-[0.95]" style={{ fontSize: "clamp(2rem, 9vw, 6rem)" }}>
              <span className="text-[var(--text-primary)]">Максим</span><br />
              <span className="gradient-text">Новиков</span>
            </h1>

            <div className="reveal text-[var(--text-secondary)] max-w-xl" style={{ marginTop: "clamp(24px, 4vw, 32px)", fontSize: "clamp(1rem, 2.5vw, 1.25rem)", minHeight: "2.5em" }}>
              <span>{typed}</span>
              <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-1 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
            </div>

            <div className="reveal flex flex-col sm:flex-row gap-4" style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
              <a href="#contact" className="btn-primary">Обсудить проект <ArrowRight size={14} /></a>
              <a href="#projects" className="btn-secondary">Смотреть проекты</a>
            </div>

            <div className="reveal flex items-center gap-5 sm:gap-6" style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
              {HERO_SOCIALS.map((s) => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300">
                  {SOCIAL_ICONS[s.icon]}
                </a>
              ))}
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
            </div>
          </div>

          {/* Decoration */}
          <div className="hidden lg:block relative" aria-hidden="true">
            <div className="w-72 xl:w-80 2xl:w-96 h-72 xl:h-80 2xl:h-96 relative" style={{ animation: "float 6s ease-in-out infinite" }}>
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
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4" style={{ padding: "clamp(28px, 4vw, 56px) clamp(20px, 5vw, 64px)", gap: "clamp(16px, 3vw, 48px)" }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center group" style={{ animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}>
              <div className="font-display font-bold text-[var(--accent)]" style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}>{s.value}</div>
              <div className="text-[12px] text-[var(--text-muted)] mt-2 tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <MobileDivider />

      {/* ═══ ABOUT ═══ */}
      <Section id="about">
        <SectionHeader label="Обо мне" title="Создаю надёжную" secondary="инфраструктуру" />
        <div className="grid lg:grid-cols-2 items-start" style={{ gap: "clamp(32px, 5vw, 80px)" }}>
          <div>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed" style={{ fontSize: "clamp(0.95rem, 2vw, 1.125rem)" }}>
              DevOps инженер с опытом 5+ лет в продуктовых компаниях. Специализируюсь на построении и автоматизации облачной инфраструктуры, Kubernetes, CI/CD и observability для highload-проектов.
            </p>
            <p className="reveal text-[var(--text-secondary)] leading-relaxed" style={{ marginTop: "clamp(16px, 3vw, 24px)", fontSize: "clamp(0.875rem, 1.8vw, 1rem)" }}>
              Превращаю сложные инфраструктурные задачи в элегантные автоматизированные решения. GitOps, immutable infrastructure, culture of reliability — не просто модные слова, а ежедневная практика, которая помогает командам двигаться быстрее и спать спокойнее.
            </p>
            <div className="reveal h-[1px] bg-gradient-to-r from-[var(--border-accent)] via-[var(--border)] to-transparent" style={{ marginTop: "clamp(24px, 4vw, 32px)" }} />
          </div>
          <div className="grid" style={{ gap: "clamp(20px, 3vw, 20px)" }}>
            {VALUES.map((item, i) => (
              <TiltCard key={item.title} className={`reveal stagger-${i + 1}`}>
                <div className="card card-glow" style={{ padding: "clamp(20px, 4vw, 24px)" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="accent-dot" />
                    <h3 className="font-semibold text-[var(--text-primary)] text-base">{item.title}</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ SERVICES ═══ */}
      <Section id="services">
        <SectionHeader label="Услуги" title="Чем могу" secondary="помочь" />
        <div className="grid min-[480px]:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(16px, 3vw, 24px)" }}>
          {SERVICES.map((s, i) => (
            <TiltCard key={s.title} className={`reveal stagger-${Math.min(i + 1, 5)}`}>
              <div className="card card-glow h-full" style={{ padding: "clamp(20px, 3vw, 28px)" }}>
                <div className="text-[var(--accent)] mb-5">{SERVICE_ICONS[s.icon]}</div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] mb-3">{s.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ CTA BANNER ═══ */}
      <div className="relative z-10 max-w-[1400px] 2xl:max-w-[1600px] mx-auto" style={{ padding: "clamp(16px, 3vw, 64px) clamp(20px, 5vw, 64px)" }}>
        <div className="card text-center border-[var(--border-accent)]" style={{ padding: "clamp(28px, 5vw, 64px) clamp(20px, 4vw, 48px)", background: "linear-gradient(135deg, var(--bg-card) 0%, #0f1a0f 100%)" }}>
          <h3 className="font-display font-bold" style={{ fontSize: "clamp(1.25rem, 4vw, 2.5rem)", marginBottom: "clamp(16px, 3vw, 20px)" }}>
            Нужна надёжная <span className="gradient-text">инфраструктура?</span>
          </h3>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto" style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", marginBottom: "clamp(24px, 4vw, 32px)" }}>
            Расскажите о вашем проекте — предложу оптимальное решение по архитектуре, стеку и автоматизации. Первая консультация бесплатна.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="#contact" className="btn-primary sm:!w-auto">Обсудить проект <ArrowRight size={14} /></a>
            <a href="https://t.me/your_telegram" target="_blank" rel="noopener noreferrer" className="btn-secondary sm:!w-auto">Написать в Telegram</a>
          </div>
        </div>
      </div>

      <MobileDivider />

      {/* ═══ SKILLS ═══ */}
      <Section id="skills">
        <SectionHeader label="Навыки" title="Технологии и" secondary="инструменты" />
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4" style={{ gap: "clamp(24px, 4vw, 32px)" }}>
          {SKILLS.map((cat, i) => (
            <div key={cat.title} className={`reveal stagger-${i + 1}`}>
              <h3 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)]" style={{ marginBottom: "clamp(12px, 2vw, 20px)" }}>{cat.title}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 10px)" }}>
                {cat.items.map((skill) => (
                  <div key={skill} className="group flex items-center gap-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 cursor-default" style={{ padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 scale-0 group-hover:scale-100 transition-transform duration-300" />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ PROJECTS ═══ */}
      <Section id="projects">
        <SectionHeader label="Проекты" title="Избранные" secondary="кейсы" />
        <div className="grid min-[540px]:grid-cols-2 xl:grid-cols-2" style={{ gap: "clamp(16px, 2vw, 28px)" }}>
          {PROJECTS.map((p, i) => (
            <TiltCard key={p.num} className={`reveal stagger-${i + 1}`}>
              <div className={`card card-glow group h-full ${p.accent ? "border-[var(--border-accent)]" : ""}`} style={{ padding: "clamp(20px, 3vw, 32px)" }}>
                <div className="flex items-start justify-between" style={{ marginBottom: "clamp(16px, 3vw, 24px)" }}>
                  <span className="font-display font-bold text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors duration-500" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>{p.num}</span>
                  <ArrowUpRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">{p.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed" style={{ marginBottom: "clamp(16px, 3vw, 24px)" }}>{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ EXPERIENCE ═══ */}
      <Section id="experience">
        <SectionHeader label="Опыт" title="Карьерный" secondary="путь" />
        <div className="relative">
          <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--accent-muted)] via-[var(--border)] to-transparent hidden md:block" aria-hidden="true" />
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 4vw, 32px)" }}>
            {EXPERIENCE.map((exp, i) => (
              <div key={exp.period} className={`reveal stagger-${i + 1} md:pl-10 relative`}>
                <div className="hidden md:block absolute left-[7px] top-7 sm:top-8 w-[9px] h-[9px] rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" aria-hidden="true" />
                <TiltCard>
                  <div className="card" style={{ padding: "clamp(20px, 4vw, 32px)" }}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between" style={{ gap: "clamp(8px, 2vw, 16px)" }}>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block md:hidden text-[11px] tracking-wider text-[var(--text-muted)] uppercase font-medium mb-2">{exp.period}</span>
                        <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--text-primary)]">{exp.role}</h3>
                        <p className="text-sm text-[var(--accent)] mt-1.5 mb-3">{exp.company}</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{exp.desc}</p>
                      </div>
                      <span className="hidden md:inline-block text-[12px] tracking-wider text-[var(--text-muted)] uppercase whitespace-nowrap font-medium md:mt-1 shrink-0">{exp.period}</span>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ TESTIMONIALS ═══ */}
      <Section id="testimonials">
        <SectionHeader label="Отзывы" title="Что говорят" secondary="коллеги и клиенты" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(16px, 3vw, 24px)" }}>
          {TESTIMONIALS.map((t, i) => (
            <TiltCard key={t.author} className={`reveal stagger-${i + 1}`}>
              <div className="card card-glow h-full flex flex-col" style={{ padding: "clamp(24px, 4vw, 28px)" }}>
                <div className="text-[var(--accent)] text-3xl font-display leading-none mb-4">&ldquo;</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">{t.text}</p>
                <div className="pt-4 border-t border-[var(--border)]" style={{ marginTop: "clamp(16px, 3vw, 24px)" }}>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{t.author}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">{t.role}</div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ CERTIFICATIONS ═══ */}
      <Section id="certifications">
        <SectionHeader label="Сертификации" title="Подтверждённые" secondary="компетенции" />
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4" style={{ gap: "clamp(16px, 3vw, 20px)" }}>
          {CERTIFICATIONS.map((cert, i) => (
            <div key={cert.name} className={`reveal stagger-${i + 1} card card-glow text-center`} style={{ padding: "clamp(20px, 4vw, 24px)" }}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center">
                <span className="text-[var(--accent)] text-lg font-bold font-display">{cert.issuer.charAt(0)}</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{cert.name}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">{cert.issuer} &middot; {cert.year}</p>
            </div>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ CONTACT ═══ */}
      <Section id="contact">
        <div className="grid lg:grid-cols-2 items-start" style={{ gap: "clamp(32px, 5vw, 80px)" }}>
          <div>
            <SectionHeader label="Контакт" title="Давайте" secondary="работать вместе" />
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-md" style={{ fontSize: "clamp(0.95rem, 2vw, 1.125rem)" }}>
              Открыт к интересным предложениям и проектам. Расскажите о задаче — обсудим, как я могу помочь.
            </p>
            <div className="reveal flex items-center gap-3 text-[var(--text-muted)] text-sm" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              Обычно отвечаю в течение 24 часов
            </div>
          </div>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 16px)" }}>
            {CONTACTS.map((link) => (
              <TiltCard key={link.label}>
                <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="card card-glow flex items-center justify-between group" style={{ padding: "clamp(16px, 3vw, 20px)", gap: "12px" }}>
                  <div className="min-w-0">
                    <div className="text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase mb-1.5">{link.label}</div>
                    <div className="text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300 truncate">{link.value}</div>
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </a>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="glow-line absolute top-0 left-0 w-full h-[1px]" />
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto" style={{ padding: "clamp(32px, 4vw, 56px) clamp(20px, 5vw, 64px)" }}>
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3" style={{ gap: "clamp(24px, 4vw, 40px)", marginBottom: "clamp(24px, 4vw, 40px)" }}>
            <div>
              <span className="font-display text-2xl font-bold">
                <span className="text-[var(--accent)]">M</span><span className="text-[var(--text-primary)]">.</span>
              </span>
              <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
                DevOps инженер, создающий надёжную и масштабируемую инфраструктуру для современных продуктов.
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">Навигация</h4>
              <div className="space-y-3">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">Контакты</h4>
              <div className="space-y-3">
                {CONTACTS.slice(0, 3).map((c) => (
                  <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{c.value}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="h-[1px] bg-[var(--border)]" style={{ marginBottom: "clamp(20px, 3vw, 32px)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--text-muted)]">
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
