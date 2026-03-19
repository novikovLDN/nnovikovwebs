"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, ArrowUpRight, Code2, Layers, Zap, BarChart3, Palette, ShieldCheck, Send, Mail, ChevronDown, Shield, Smartphone, Globe, CheckCircle, Users, Rocket, MessageSquare, Sparkles, X } from "lucide-react";
import { useI18n, LangSwitcher } from "./lib/i18n";

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
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ═══════════════════════════════════════════════════
   LOADING SCREEN
   ═══════════════════════════════════════════════════ */

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const orb = orbRef.current;
    const logo = logoRef.current;
    const subtitle = subtitleRef.current;
    const barFill = barFillRef.current;
    const percent = percentRef.current;
    if (!container || !orb || !logo || !subtitle || !barFill || !percent) return;

    let raf: number;
    const start = performance.now();
    const duration = 2200;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const e = 1 - Math.pow(1 - t, 5);
      const p = e * 100;

      orb.style.opacity = String(e);
      orb.style.transform = `scale(${0.8 + e * 0.2})`;

      const logoOpacity = Math.min(t / 0.25, 1);
      const logoY = (1 - Math.min(t / 0.35, 1)) * 16;
      logo.style.opacity = String(logoOpacity);
      logo.style.transform = `translate3d(0, ${logoY}px, 0)`;

      const subOpacity = Math.max(0, (t - 0.2) / 0.3);
      const subY = Math.max(0, (1 - Math.min((t - 0.2) / 0.35, 1)) * 10);
      subtitle.style.opacity = String(Math.min(subOpacity, 1));
      subtitle.style.transform = `translate3d(0, ${subY}px, 0)`;

      barFill.style.transform = `scaleX(${e})`;

      const pctOpacity = Math.min(t / 0.15, 1);
      percent.style.opacity = String(pctOpacity);
      percent.textContent = `${Math.round(p)}%`;

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        container.style.transition = "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        container.style.opacity = "0";
        container.style.filter = "blur(8px)";
        container.style.pointerEvents = "none";
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 820);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{ background: "var(--bg-deep)", willChange: "opacity, filter" }}
    >
      <div
        ref={orbRef}
        className="absolute rounded-full"
        style={{
          width: "clamp(200px, 50vw, 400px)",
          height: "clamp(200px, 50vw, 400px)",
          background: "radial-gradient(circle, rgba(0,255,106,0.1) 0%, rgba(0,204,255,0.04) 40%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0,
          willChange: "opacity, transform",
        }}
      />
      <div className="relative" style={{ marginBottom: "clamp(24px, 5vw, 40px)" }}>
        <h1
          ref={logoRef}
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 10vw, 5rem)", opacity: 0, willChange: "opacity, transform" }}
        >
          <span className="text-[var(--accent)]">Q</span>
          <span className="text-[var(--text-primary)]">oDev</span>
        </h1>
        <div
          ref={subtitleRef}
          className="text-center tracking-[0.3em] uppercase font-medium"
          style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "var(--text-muted)", marginTop: "clamp(4px, 1vw, 8px)", opacity: 0, willChange: "opacity, transform" }}
        >
          Software Agency
        </div>
      </div>
      <div className="relative" style={{ width: "clamp(160px, 40vw, 280px)" }}>
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            ref={barFillRef}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent), #00ccff)", boxShadow: "0 0 16px var(--accent-glow)", transformOrigin: "left", transform: "scaleX(0)", willChange: "transform" }}
          />
        </div>
        <div
          ref={percentRef}
          className="text-center tracking-[0.15em] font-medium tabular-nums"
          style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "var(--text-muted)", marginTop: "clamp(12px, 3vw, 16px)", opacity: 0, willChange: "opacity" }}
        >
          0%
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════ */

const MARQUEE_ITEMS = [
  "React", "Next.js", "TypeScript", "Node.js", "Swift", "Kotlin",
  "Figma", "Kubernetes", "Docker", "AWS", "PostgreSQL", "Redis",
  "GraphQL", "REST API", "CI/CD", "Terraform",
];

function Marquee() {
  return (
    <div className="relative z-10 border-y border-[var(--border)] overflow-hidden" style={{ background: "rgba(8,8,8,0.5)" }}>
      <div className="marquee-track flex" style={{ padding: "clamp(14px, 2vw, 20px) 0" }}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-3 shrink-0" style={{ padding: "0 clamp(16px, 3vw, 32px)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-50" />
            <span className="text-[13px] sm:text-sm font-medium text-[var(--text-muted)] whitespace-nowrap tracking-wide">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════════════════════ */


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
      if (now - lastTime < 33) return;
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
   COMPONENTS
   ═══════════════════════════════════════════════════ */

function Nav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("");
  const lastScrollY = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NAV = [
    { href: "#services", label: t("Услуги", "Services") },
    { href: "#projects", label: t("Проекты", "Projects") },
    { href: "#process", label: t("Процесс", "Process") },
    { href: "#why", label: t("Почему мы", "Why Us") },
    { href: "#contact", label: t("Контакт", "Contact") },
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      if (y > 100) {
        const scrollingDown = y > lastScrollY.current && y - lastScrollY.current > 5;
        const scrollingUp = y < lastScrollY.current && lastScrollY.current - y > 5;

        if (scrollingDown) {
          if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
          setHidden(true);
        } else if (scrollingUp) {
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

      const sections = ["services", "projects", "process", "why", "contact"];
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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 ${scrolled && !mobileOpen ? "backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]" : ""}`}
        style={{
          background: mobileOpen ? "transparent" : scrolled ? "rgba(8, 8, 8, 0.35)" : "transparent",
          transform: hidden && !mobileOpen ? "translateY(-100%)" : undefined,
          transition: "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.8s cubic-bezier(0.25, 1, 0.5, 1), backdrop-filter 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto flex items-center justify-between relative z-50" style={{ padding: "18px clamp(24px, 5vw, 48px)" }}>
          <a href="#" className="font-display text-xl xl:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2" aria-label="QoDev">
            <span className="text-[var(--accent)]">Q</span><span className="text-[var(--text-primary)]">oDev</span>
          </a>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className={`px-3 xl:px-4 2xl:px-5 py-2 text-[13px] xl:text-[14px] 2xl:text-[15px] transition-colors duration-300 tracking-wide relative whitespace-nowrap ${active === item.href.slice(1) ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                {item.label}
                {active === item.href.slice(1) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />}
              </a>
            ))}
            <LangSwitcher className="ml-3 xl:ml-4" />
            <a href="#contact" className="ml-4 xl:ml-5 btn-primary shrink-0" style={{ padding: "12px 32px", fontSize: "14px", width: "auto", borderRadius: "100px" }}>{t("Обсудить проект", "Start a Project")}</a>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <LangSwitcher />
            <button onClick={() => setMobileOpen(true)} className="text-[var(--text-primary)] w-10 h-10 flex flex-col items-center justify-center gap-1.5 relative z-[60]" aria-label="Open menu">
              <span className="block w-5 h-[1.5px] bg-current" />
              <span className="block w-5 h-[1.5px] bg-current" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className="lg:hidden fixed inset-0 z-[100]"
        style={{
          pointerEvents: mobileOpen ? "auto" : "none",
          opacity: mobileOpen ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0" style={{ background: "rgba(8, 8, 8, 0.97)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }} onClick={() => setMobileOpen(false)} />

        {/* Menu content */}
        <div className="relative flex flex-col h-full">
          {/* Top bar with logo + close */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: "18px clamp(24px, 5vw, 48px)" }}>
            <a href="#" onClick={() => setMobileOpen(false)} className="font-display text-xl font-bold tracking-tight flex items-center gap-2" aria-label="QoDev">
              <span className="text-[var(--accent)]">Q</span><span className="text-[var(--text-primary)]">oDev</span>
            </a>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:bg-[rgba(255,255,255,0.08)]"
              style={{ border: "1px solid var(--border)" }}
              aria-label={t("Закрыть меню", "Close menu")}
            >
              <X size={18} className="text-[var(--text-primary)]" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 flex flex-col justify-center" style={{ padding: "0 clamp(32px, 8vw, 64px)" }}>
            <div className="flex flex-col" style={{ gap: "clamp(4px, 1.5vw, 8px)" }}>
              {NAV.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center justify-between rounded-2xl transition-all duration-200"
                  style={{
                    padding: "clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)",
                    background: active === item.href.slice(1) ? "rgba(0,255,106,0.06)" : "transparent",
                    border: active === item.href.slice(1) ? "1px solid rgba(0,255,106,0.15)" : "1px solid transparent",
                    transform: mobileOpen ? "translateY(0)" : "translateY(24px)",
                    opacity: mobileOpen ? 1 : 0,
                    transition: `transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s, opacity 0.4s ease ${i * 0.06}s, background 0.2s ease, border-color 0.2s ease`,
                  }}
                >
                  <span className={`font-display font-semibold tracking-tight ${active === item.href.slice(1) ? "text-[var(--accent)]" : "text-[var(--text-primary)] group-hover:text-[var(--accent)]"}`} style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)" }}>
                    {item.label}
                  </span>
                  <ArrowRight size={16} className={`transition-all duration-200 ${active === item.href.slice(1) ? "text-[var(--accent)] opacity-100" : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
                </a>
              ))}
            </div>

            {/* CTA button */}
            <div style={{
              marginTop: "clamp(24px, 5vw, 40px)",
              transform: mobileOpen ? "translateY(0)" : "translateY(24px)",
              opacity: mobileOpen ? 1 : 0,
              transition: `transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${NAV.length * 0.06}s, opacity 0.4s ease ${NAV.length * 0.06}s`,
            }}>
              <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-primary flex items-center justify-center gap-2 w-full" style={{ padding: "16px 32px", borderRadius: "16px", fontSize: "clamp(0.9rem, 3vw, 1rem)", minHeight: "48px" }}>
                {t("Обсудить проект", "Start a Project")} <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Bottom contacts */}
          <div className="shrink-0" style={{
            padding: "clamp(16px, 3vw, 24px) clamp(32px, 8vw, 64px)",
            borderTop: "1px solid var(--border)",
            transform: mobileOpen ? "translateY(0)" : "translateY(16px)",
            opacity: mobileOpen ? 1 : 0,
            transition: `transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${(NAV.length + 1) * 0.06}s, opacity 0.4s ease ${(NAV.length + 1) * 0.06}s`,
          }}>
            <div className="flex items-center justify-center gap-6 text-[13px] text-[var(--text-muted)]">
              <a href="mailto:hello@qodev.com" className="hover:text-[var(--accent)] transition-colors">hello@qodev.com</a>
              <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
              <a href="https://t.me/qodev_agency" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Telegram</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileDivider() {
  return <div className="mobile-divider hidden max-[768px]:block" aria-hidden="true" />;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const active = useRef(false);

  const animate = useCallback(() => {
    const el = ref.current;
    const glow = glowRef.current;
    if (!el) return;

    current.current.x += (target.current.x - current.current.x) * 0.12;
    current.current.y += (target.current.y - current.current.y) * 0.12;

    const rx = current.current.y * -8;
    const ry = current.current.x * 8;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.02)`;

    if (glow) {
      const gx = (current.current.x + 0.5) * 100;
      const gy = (current.current.y + 0.5) * 100;
      glow.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(0,255,106,0.08) 0%, transparent 60%)`;
    }

    if (active.current) {
      rafId.current = requestAnimationFrame(animate);
    }
  }, []);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.innerWidth < 768) return;
    const rect = el.getBoundingClientRect();
    target.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    target.current.y = (e.clientY - rect.top) / rect.height - 0.5;

    if (!active.current) {
      active.current = true;
      rafId.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handleLeave = useCallback(() => {
    active.current = false;
    cancelAnimationFrame(rafId.current);
    target.current = { x: 0, y: 0 };
    current.current = { x: 0, y: 0 };
    if (ref.current) ref.current.style.transform = "";
    if (glowRef.current) glowRef.current.style.background = "transparent";
  }, []);

  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform", position: "relative" }}>
      <div ref={glowRef} className="absolute inset-0 rounded-2xl pointer-events-none z-10" style={{ transition: "background 0.3s ease" }} />
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

function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const counter = useCountUp(value, 2200);
  return (
    <div ref={counter.ref} className="text-center group">
      <div className="font-display font-bold text-[var(--accent)]" style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
        {counter.value}{suffix}
      </div>
      <div className="text-[10px] sm:text-[12px] text-[var(--text-muted)] mt-1 sm:mt-2 tracking-wider uppercase">{label}</div>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();

  const typed = useTyping(
    [
      t("создаём цифровые продукты", "we build digital products"),
      t("проектируем масштабируемые системы", "we design scalable systems"),
      t("трансформируем бизнес в технологии", "we turn business into technology"),
      t("строим будущее вашего бизнеса", "we shape the future of your business"),
    ],
    65, 2000
  );
  const heroRef = useScrollReveal();
  const [loaded, setLoaded] = useState(false);
  const onLoadComplete = useCallback(() => setLoaded(true), []);
  useSmoothAnchors();

  const SERVICES = [
    { title: t("Веб-приложения", "Web Applications"), desc: t("Высоконагруженные веб-платформы, SaaS-решения и корпоративные порталы. Архитектура, которая масштабируется вместе с вашим бизнесом.", "High-load web platforms, SaaS solutions, and enterprise portals. Architecture that scales with your business."), icon: <Globe size={28} /> },
    { title: t("Мобильная разработка", "Mobile Development"), desc: t("Нативные и кроссплатформенные приложения для iOS и Android. Безупречный UX, который удерживает пользователей.", "Native and cross-platform apps for iOS and Android. Flawless UX that keeps users engaged."), icon: <Smartphone size={28} /> },
    { title: t("UI/UX Дизайн", "UI/UX Design"), desc: t("Интерфейсы, которые конвертируют. Исследования, прототипирование, дизайн-системы — каждый пиксель работает на ваш бизнес.", "Interfaces that convert. Research, prototyping, design systems — every pixel works for your business."), icon: <Palette size={28} /> },
    { title: t("DevOps и Инфраструктура", "DevOps & Infrastructure"), desc: t("CI/CD, Kubernetes, облачная инфраструктура. Автоматизация, которая сокращает time-to-market в разы.", "CI/CD, Kubernetes, cloud infrastructure. Automation that dramatically reduces time-to-market."), icon: <Layers size={28} /> },
    { title: t("MVP и Стартапы", "MVP & Startups"), desc: t("От идеи до работающего продукта за 6-8 недель. Lean-подход, быстрые итерации, валидация гипотез через реальный продукт.", "From idea to working product in 6-8 weeks. Lean approach, rapid iterations, hypothesis validation through a real product."), icon: <Rocket size={28} /> },
    { title: t("Аудит и Оптимизация", "Audit & Optimization"), desc: t("Глубокий анализ кодовой базы, производительности и архитектуры. Находим узкие места и устраняем технический долг.", "In-depth analysis of codebase, performance, and architecture. We find bottlenecks and eliminate technical debt."), icon: <BarChart3 size={28} /> },
  ];

  const PROJECTS = [
    {
      num: "01",
      title: "Atlas Secure",
      desc: t(
        "Комплексная VPN-платформа с собственной инфраструктурой шифрования на базе VLESS + Reality. Кроссплатформенное решение для iOS, Android, macOS, Windows, роутеров и Smart TV. Безопасность корпоративного уровня для частных пользователей.",
        "Comprehensive VPN platform with proprietary encryption infrastructure based on VLESS + Reality. Cross-platform solution for iOS, Android, macOS, Windows, routers, and Smart TV. Enterprise-grade security for individual users."
      ),
      tags: ["VPN", "Security", "Cross-platform", "Infrastructure"],
      accent: true,
      link: "/atlas/report",
    },
    {
      num: "02",
      title: t("Only — Трекер привычек", "Only — Habit Tracker"),
      desc: t(
        "Интеллектуальный трекер привычек с адаптивной системой мотивации и глубокой аналитикой прогресса. Минималистичный интерфейс, геймификация и персональные инсайты, которые действительно меняют поведение пользователей.",
        "Intelligent habit tracker with adaptive motivation system and deep progress analytics. Minimalist interface, gamification, and personal insights that truly change user behaviour."
      ),
      tags: ["Mobile App", "iOS", "Android", "AI Analytics"],
      accent: true,
      link: null,
    },
    {
      num: "03",
      title: "FinTrack Pro",
      desc: t(
        "Платформа финансовой аналитики для малого и среднего бизнеса. Автоматическая категоризация транзакций, прогнозирование cash flow, интеграция с банковскими API. Данные, которые превращаются в стратегические решения.",
        "Financial analytics platform for SMBs. Automatic transaction categorisation, cash flow forecasting, bank API integration. Data that turns into strategic decisions."
      ),
      tags: ["FinTech", "Web App", "API", "Dashboard"],
      accent: false,
      link: null,
    },
    {
      num: "04",
      title: "CloudSync Hub",
      desc: t(
        "Корпоративная платформа для синхронизации и управления данными между облачными сервисами. Real-time синхронизация, end-to-end шифрование, гранулярный контроль доступа. Инфраструктура для команд, которые не идут на компромиссы.",
        "Enterprise platform for syncing and managing data across cloud services. Real-time synchronisation, end-to-end encryption, granular access control. Infrastructure for teams that never compromise."
      ),
      tags: ["Enterprise", "Cloud", "Real-time", "Security"],
      accent: false,
      link: null,
    },
  ];

  const PROCESS = [
    { num: "01", title: t("Аналитика и стратегия", "Analysis & Strategy"), desc: t("Погружаемся в ваш бизнес, изучаем аудиторию, конкурентов и рыночные возможности. Формируем чёткое техническое задание и дорожную карту проекта.", "We dive deep into your business, study your audience, competitors, and market opportunities. We create a clear technical brief and project roadmap.") },
    { num: "02", title: t("Дизайн и прототипирование", "Design & Prototyping"), desc: t("Создаём детализированные прототипы и UI-дизайн. Каждый экран проходит через пользовательское тестирование до начала разработки.", "We create detailed prototypes and UI designs. Every screen goes through user testing before development begins.") },
    { num: "03", title: t("Разработка и итерации", "Development & Iterations"), desc: t("Agile-спринты, ежедневные стендапы, еженедельные демо. Вы видите прогресс в реальном времени и влияете на результат на каждом этапе.", "Agile sprints, daily standups, weekly demos. You see real-time progress and influence the outcome at every stage.") },
    { num: "04", title: t("Запуск и поддержка", "Launch & Support"), desc: t("Деплой, мониторинг, A/B-тесты. После запуска — непрерывная оптимизация, техническая поддержка и развитие продукта.", "Deployment, monitoring, A/B testing. Post-launch — continuous optimisation, technical support, and product development.") },
  ];

  const WHY_US = [
    { title: t("Полный цикл разработки", "Full-Cycle Development"), desc: t("От аналитики и дизайна до DevOps и поддержки — все компетенции внутри одной команды. Никаких субподрядчиков.", "From analytics and design to DevOps and support — all competencies within a single team. No subcontractors."), icon: <Code2 size={24} /> },
    { title: t("Продуктовый подход", "Product Mindset"), desc: t("Мы не просто пишем код — мы строим продукты. Каждое техническое решение обосновано бизнес-метриками.", "We don't just write code — we build products. Every technical decision is backed by business metrics."), icon: <BarChart3 size={24} /> },
    { title: t("Прозрачность процессов", "Process Transparency"), desc: t("Доступ к задачам, коду и аналитике в реальном времени. Еженедельные отчёты и демонстрации прогресса.", "Real-time access to tasks, code, and analytics. Weekly reports and progress demos."), icon: <Users size={24} /> },
  ];

  const CONTACTS = [
    { label: "Email", value: "hello@qodev.com", href: "mailto:hello@qodev.com" },
    { label: "Telegram", value: "@qodev_agency", href: "https://t.me/qodev_agency" },
  ];

  const NAV = [
    { href: "#services", label: t("Услуги", "Services") },
    { href: "#projects", label: t("Проекты", "Projects") },
    { href: "#process", label: t("Процесс", "Process") },
    { href: "#why", label: t("Почему мы", "Why Us") },
    { href: "#contact", label: t("Контакт", "Contact") },
  ];

  return (
    <div className="grain">
      {!loaded && <LoadingScreen onComplete={onLoadComplete} />}
      <ClickRipples />
      <AnimatedBackground />
      <ParticleField />
      <Nav />
      <main>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative z-10 min-h-[100svh] flex items-center" style={{ padding: "clamp(60px, 10vw, 160px) clamp(20px, 5vw, 64px) clamp(60px, 10vw, 160px)" }}>
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 xl:gap-24 items-center">
          <div>
            <div className="reveal inline-flex items-center gap-2.5 rounded-full" style={{ marginBottom: "clamp(24px, 4vw, 32px)", padding: "8px 18px 8px 12px", background: "rgba(0,255,106,0.06)", border: "1px solid rgba(0,255,106,0.15)" }}>
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              <span className="text-[12px] tracking-[0.15em] uppercase text-[var(--accent)] font-semibold">Software Agency</span>
            </div>

            <h1 className="reveal font-display font-bold tracking-tight leading-[0.95]" style={{ fontSize: "clamp(2.5rem, 9vw, 6rem)" }}>
              <span className="text-[var(--accent)]">Q</span><span className="text-[var(--text-primary)]">oDev</span>
            </h1>

            <p className="reveal text-[var(--text-secondary)] max-w-2xl" style={{ marginTop: "clamp(16px, 3vw, 24px)", fontSize: "clamp(1rem, 2.5vw, 1.35rem)", lineHeight: 1.6 }}>
              {t(
                "Превращаем амбициозные идеи в высокотехнологичные цифровые продукты. Полный цикл разработки — от стратегии до масштабирования.",
                "We turn ambitious ideas into cutting-edge digital products. Full-cycle development — from strategy to scaling."
              )}
            </p>

            <div className="reveal text-[var(--text-muted)] max-w-2xl" style={{ marginTop: "clamp(12px, 2vw, 16px)", fontSize: "clamp(0.875rem, 2vw, 1.05rem)", minHeight: "1.8em" }}>
              <span className="text-[var(--text-secondary)]">{typed}</span>
              <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-1 align-middle" style={{ animation: "blink 1s step-end infinite" }} />
            </div>

            <div className="reveal flex flex-col sm:flex-row gap-3 sm:gap-4" style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
              <a href="#contact" className="btn-primary w-full sm:w-auto">{t("Обсудить проект", "Start a Project")} <ArrowRight size={14} /></a>
              <a href="#projects" className="btn-secondary w-full sm:w-auto">{t("Наши проекты", "Our Projects")}</a>
            </div>
          </div>

          {/* Decoration */}
          <div className="hidden lg:block relative" aria-hidden="true">
            <div className="w-72 xl:w-80 2xl:w-96 h-72 xl:h-80 2xl:h-96 relative" style={{ animation: "float 6s ease-in-out infinite" }}>
              <div className="absolute inset-0 rounded-full border border-[var(--border)]" style={{ animation: "pulse-glow 4s ease-in-out infinite" }} />
              <div className="absolute inset-4 rounded-full border border-[var(--border)] opacity-50" />
              <div className="absolute inset-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <div className="text-center">
                  <div className="font-display text-4xl xl:text-5xl font-bold gradient-text">50+</div>
                  <div className="text-[10px] xl:text-[11px] text-[var(--text-muted)] mt-2 tracking-wider uppercase">{t("проектов", "projects")}</div>
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
          <AnimatedStat value={50} suffix="+" label={t("проектов", "projects")} />
          <AnimatedStat value={98} suffix="%" label={t("довольных клиентов", "happy clients")} />
          <AnimatedStat value={4} label={t("года на рынке", "years in business")} />
          <div className="text-center group">
            <div className="font-display font-bold text-[var(--accent)]" style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>24/7</div>
            <div className="text-[10px] sm:text-[12px] text-[var(--text-muted)] mt-1 sm:mt-2 tracking-wider uppercase">{t("поддержка", "support")}</div>
          </div>
        </div>
      </div>

      {/* ═══ MARQUEE ═══ */}
      <Marquee />

      <MobileDivider />

      {/* ═══ PROJECTS ═══ */}
      <Section id="projects">
        <SectionHeader label={t("Портфолио", "Portfolio")} title={t("Избранные", "Featured")} secondary={t("проекты", "Projects")} />
        <div className="grid min-[560px]:grid-cols-2" style={{ gap: "clamp(12px, 2vw, 28px)" }}>
          {PROJECTS.map((p, i) => (
            <TiltCard key={p.num} className={`reveal stagger-${i + 1}`}>
              <div className={`card card-glow group h-full ${p.accent ? "border-[var(--border-accent)]" : ""}`} style={{ padding: "clamp(14px, 3vw, 32px)" }}>
                <div className="flex items-start justify-between" style={{ marginBottom: "clamp(12px, 3vw, 24px)" }}>
                  <span className="font-display font-bold text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors duration-500" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>{p.num}</span>
                  {p.link ? (
                    <a href={p.link} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                      <ArrowUpRight size={20} />
                    </a>
                  ) : (
                    <ArrowUpRight size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">{p.title}</h3>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed" style={{ marginBottom: "clamp(12px, 3vw, 24px)" }}>{p.desc}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {p.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ SERVICES ═══ */}
      <Section id="services">
        <SectionHeader label={t("Услуги", "Services")} title={t("Полный спектр", "Full Range of")} secondary={t("digital-решений", "Digital Solutions")} />
        <div className="grid min-[480px]:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(10px, 2.5vw, 24px)" }}>
          {SERVICES.map((s, i) => (
            <TiltCard key={s.title} className={`reveal stagger-${Math.min(i + 1, 5)}`}>
              <div className="card card-glow h-full" style={{ padding: "clamp(16px, 3vw, 28px)" }}>
                <div className="text-[var(--accent)] mb-3 sm:mb-5">{s.icon}</div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">{s.title}</h3>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ CTA BANNER ═══ */}
      <div className="relative z-10 max-w-[1400px] 2xl:max-w-[1600px] mx-auto" style={{ padding: "clamp(16px, 3vw, 64px) clamp(20px, 5vw, 64px)" }}>
        <div className="card text-center border-[var(--border-accent)] overflow-hidden" style={{ padding: "clamp(24px, 5vw, 64px) clamp(16px, 4vw, 48px)", background: "linear-gradient(135deg, var(--bg-card) 0%, #0f1a0f 100%)" }}>
          <h3 className="font-display font-bold" style={{ fontSize: "clamp(1.15rem, 4vw, 2.5rem)", marginBottom: "clamp(12px, 3vw, 20px)", lineHeight: 1.2 }}>
            {t("Есть идея?", "Got an idea?")} <span className="gradient-text">{t("Давайте реализуем.", "Let's bring it to life.")}</span>
          </h3>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto" style={{ fontSize: "clamp(0.8rem, 2vw, 1rem)", marginBottom: "clamp(20px, 4vw, 32px)", lineHeight: 1.6 }}>
            {t(
              "Расскажите о вашем проекте — проведём бесплатную консультацию, оценим сроки и предложим оптимальное технологическое решение.",
              "Tell us about your project — we'll provide a free consultation, estimate timelines, and propose the optimal technology solution."
            )}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="#contact" className="btn-primary w-full sm:w-auto text-center">{t("Обсудить проект", "Start a Project")} <ArrowRight size={14} /></a>
            <a href="https://t.me/qodev_agency" target="_blank" rel="noopener noreferrer" className="btn-secondary w-full sm:w-auto text-center">{t("Написать в Telegram", "Message on Telegram")}</a>
          </div>
        </div>
      </div>

      <MobileDivider />

      {/* ═══ PROCESS ═══ */}
      <Section id="process">
        <SectionHeader label={t("Процесс", "Process")} title={t("Как мы", "How We")} secondary={t("работаем", "Work")} />
        <div className="relative">
          <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--accent-muted)] via-[var(--border)] to-transparent hidden md:block" aria-hidden="true" />
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px, 4vw, 32px)" }}>
            {PROCESS.map((step, i) => (
              <div key={step.num} className={`reveal stagger-${i + 1} md:pl-10 relative`}>
                <div className="hidden md:block absolute left-[7px] top-7 sm:top-8 w-[9px] h-[9px] rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow-strong)]" aria-hidden="true" />
                <TiltCard>
                  <div className="card" style={{ padding: "clamp(14px, 4vw, 32px)" }}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="font-display font-bold text-[var(--accent)] shrink-0" style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}>{step.num}</span>
                      <div className="min-w-0">
                        <h3 className="font-display text-[15px] sm:text-lg font-semibold text-[var(--text-primary)] mb-1.5 sm:mb-2">{step.title}</h3>
                        <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ WHY US ═══ */}
      <Section id="why">
        <SectionHeader label={t("Преимущества", "Advantages")} title={t("Почему выбирают", "Why Choose")} secondary="QoDev" />
        <div className="grid min-[560px]:grid-cols-2 lg:grid-cols-3" style={{ gap: "clamp(12px, 3vw, 24px)" }}>
          {WHY_US.map((item, i) => (
            <TiltCard key={item.title} className={`reveal stagger-${i + 1}`}>
              <div className="card card-glow h-full" style={{ padding: "clamp(14px, 3vw, 32px)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-5" style={{ background: "rgba(0,255,106,0.08)", border: "1px solid rgba(0,255,106,0.15)" }}>
                  <span className="text-[var(--accent)]">{item.icon}</span>
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </Section>

      <MobileDivider />

      {/* ═══ CONTACT ═══ */}
      <Section id="contact">
        <div className="grid lg:grid-cols-2 items-start" style={{ gap: "clamp(32px, 5vw, 80px)" }}>
          <div>
            <SectionHeader label={t("Контакт", "Contact")} title={t("Начнём", "Let's Start")} secondary={t("сотрудничество", "Working Together")} />
            <p className="reveal text-[var(--text-secondary)] leading-relaxed max-w-md" style={{ fontSize: "clamp(0.85rem, 2vw, 1.125rem)" }}>
              {t(
                "Расскажите о вашей идее или задаче. Мы проведём бесплатную консультацию, оценим объём работ и предложим оптимальное решение.",
                "Tell us about your idea or challenge. We'll provide a free consultation, estimate the scope, and propose the best solution."
              )}
            </p>
            <div className="reveal flex items-center gap-2 sm:gap-3 text-[var(--text-muted)] text-[13px] sm:text-sm" style={{ marginTop: "clamp(16px, 3vw, 32px)" }}>
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
              {t("Обычно отвечаем в течение 2 часов", "We usually respond within 2 hours")}
            </div>
          </div>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 16px)" }}>
            {CONTACTS.map((link) => (
              <TiltCard key={link.label}>
                <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="card card-glow flex items-center justify-between group" style={{ padding: "clamp(12px, 3vw, 20px)", gap: "12px" }}>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] tracking-[0.15em] uppercase mb-1 sm:mb-1.5">{link.label}</div>
                    <div className="text-[13px] sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300 truncate">{link.value}</div>
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
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4" style={{ gap: "clamp(24px, 4vw, 40px)", marginBottom: "clamp(24px, 4vw, 40px)" }}>
            <div>
              <span className="font-display text-xl sm:text-2xl font-bold">
                <span className="text-[var(--accent)]">Q</span><span className="text-[var(--text-primary)]">oDev</span>
              </span>
              <p className="mt-3 sm:mt-4 text-[13px] sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
                {t(
                  "Software agency, которое превращает амбициозные идеи в технологические продукты мирового уровня.",
                  "A software agency that turns ambitious ideas into world-class technology products."
                )}
              </p>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">{t("Навигация", "Navigation")}</h4>
              <div className="space-y-3">
                {NAV.map((item) => (
                  <a key={item.href} href={item.href} className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{item.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">{t("Контакты", "Contacts")}</h4>
              <div className="space-y-3">
                {CONTACTS.map((c) => (
                  <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="block text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">{c.value}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-4">{t("Язык", "Language")}</h4>
              <LangSwitcher />
            </div>
          </div>
          <div className="h-[1px] bg-[var(--border)]" style={{ marginBottom: "clamp(20px, 3vw, 32px)" }} />
          {/* Legal info */}
          <div className="flex flex-col gap-4 text-[11px] sm:text-[12px] text-[var(--text-muted)] leading-relaxed">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p><span className="text-[var(--accent)]">&copy;</span> {new Date().getFullYear()} QoDev Software Agency</p>
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                {t("Разработано QoDev", "Developed by QoDev")}
              </p>
            </div>
            <div className="h-[1px] bg-[var(--border)]" />
            <div className="text-[9px] sm:text-[11px] text-[var(--text-muted)] leading-relaxed space-y-1 sm:space-y-1.5">
              <p>QoDev Limited</p>
              <p className="break-words">{t(
                "Юридический адрес: Level 15, The Hong Kong Club Building, 3A Chater Road, Central, Hong Kong",
                "Registered address: Level 15, The Hong Kong Club Building, 3A Chater Road, Central, Hong Kong"
              )}</p>
              <p>{t(
                "Все права защищены. Использование материалов сайта допускается только с письменного разрешения правообладателя.",
                "All rights reserved. Use of site materials is permitted only with the written consent of the copyright holder."
              )}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
