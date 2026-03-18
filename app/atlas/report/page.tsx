"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Shield, TrendingUp, TrendingDown, Users, CreditCard,
  DollarSign, BarChart3, PieChart, Activity, ChevronDown, ChevronUp,
  Lock, Server, Code2, Wallet, AlertTriangle, CheckCircle, Target,
  Zap, ArrowUpRight, ArrowRight, Megaphone, Share2, Globe, Send, Mail,
} from "lucide-react";
import { useI18n, LangSwitcher } from "../../lib/i18n";

/* ═══════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000, decimals = 0) {
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
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = eased * target;
            setValue(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.floor(v));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { value, ref };
}

function useAnimateOnView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ═══════════════════════════════════════════════════
   ANIMATED BAR CHART
   ═══════════════════════════════════════════════════ */

function BarChart({ data, maxValue }: { data: { label: string; value: number; subLabel?: string }[]; maxValue: number }) {
  const anim = useAnimateOnView();

  return (
    <div ref={anim.ref} style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 16px)" }}>
      {data.map((d, i) => {
        const pct = (d.value / maxValue) * 100;
        return (
          <div key={d.label}>
            <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 gap-2">
              <span className="text-[11px] sm:text-[13px] text-[var(--text-secondary)] font-medium truncate min-w-0">{d.label}</span>
              <span className="text-[11px] sm:text-[13px] font-bold text-[var(--text-primary)] tabular-nums whitespace-nowrap shrink-0">{d.value.toLocaleString("ru-RU")} ₽</span>
            </div>
            <div className="h-7 sm:h-8 md:h-10 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <div
                className="h-full rounded-lg flex items-center justify-end pr-2 sm:pr-3"
                style={{
                  width: anim.visible ? `${pct}%` : "0%",
                  background: `linear-gradient(90deg, rgba(0,255,106,${0.15 + i * 0.05}), rgba(0,255,106,${0.3 + i * 0.08}))`,
                  borderRight: "2px solid var(--accent)",
                  transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.15}s`,
                }}
              >
                <span className="text-[9px] sm:text-[11px] font-bold text-[var(--accent)] tabular-nums whitespace-nowrap">{d.subLabel}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ANIMATED DONUT CHART
   ═══════════════════════════════════════════════════ */

function DonutChart({ segments, totalLabel }: { segments: { label: string; value: number; color: string }[]; totalLabel: string }) {
  const anim = useAnimateOnView();
  const [size, setSize] = useState(190);
  const total = segments.reduce((s, d) => s + d.value, 0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setSize(w < 380 ? 140 : w < 480 ? 160 : w < 768 ? 175 : 190);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const r = (size - 28) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const sw = size < 160 ? 12 : 16;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const len = circumference * pct;
    const gap = 4;
    const arc = { ...seg, pct, dasharray: `${len - gap} ${circumference - len + gap}`, dashoffset: -offset + circumference / 4 };
    offset += len;
    return arc;
  });

  return (
    <div ref={anim.ref} className="flex flex-col items-center" style={{ gap: "clamp(12px, 3vw, 24px)" }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block w-full h-full">
          {arcs.map((arc, i) => (
            <circle
              key={arc.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={anim.visible ? arc.dasharray : `0 ${circumference}`}
              strokeDashoffset={arc.dashoffset}
              style={{ transition: `stroke-dasharray 1.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.12}s`, opacity: 0.85 }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-[var(--text-primary)]" style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)" }}>{total.toLocaleString("ru-RU")}</span>
          <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] tracking-wider uppercase">{totalLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center" style={{ gap: "clamp(6px, 2vw, 16px)" }}>
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ background: arc.color }} />
            <span className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{arc.label} <span className="text-[var(--text-muted)]">{Math.round(arc.pct * 100)}%</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EXPANDING SECTION
   ═══════════════════════════════════════════════════ */

function ReportSection({ id, icon, title, badge, children, defaultOpen = false }: {
  id: string; icon: React.ReactNode; title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl sm:rounded-2xl transition-all duration-300" style={{
      background: "var(--bg-card)",
      border: open ? "1px solid var(--border-accent)" : "1px solid var(--border)",
    }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 sm:gap-4 text-left" style={{ padding: "clamp(14px, 3vw, 24px)" }}>
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,106,0.06)", border: "1px solid var(--border)" }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-[var(--text-primary)]" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)" }}>{title}</span>
            {badge && (
              <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider"
                style={{ background: "rgba(0,255,106,0.1)", color: "var(--accent)", border: "1px solid rgba(0,255,106,0.15)" }}>
                {badge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] tracking-wider uppercase">{id}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-[var(--accent)] shrink-0" /> : <ChevronDown size={18} className="text-[var(--text-muted)] shrink-0" />}
      </button>
      <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: open ? "8000px" : "0", opacity: open ? 1 : 0 }}>
        <div style={{ padding: "clamp(4px, 1vw, 8px) clamp(16px, 3vw, 24px) clamp(20px, 3vw, 28px)", display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════════════ */

function KpiCard({ label, value, sub, icon, accent = false }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className="rounded-xl transition-all duration-300 hover:border-[var(--border-accent)] group overflow-hidden"
      style={{ padding: "clamp(10px, 2.5vw, 20px)", background: accent ? "rgba(0,255,106,0.04)" : "var(--bg-card)", border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}` }}>
      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-1">
        <span className="text-[9px] min-[480px]:text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-[var(--text-muted)] leading-tight min-w-0">{label}</span>
        <span className="text-[var(--accent)] opacity-60 group-hover:opacity-100 transition-opacity shrink-0 hidden min-[420px]:block">{icon}</span>
      </div>
      <div className="font-display font-bold text-[var(--text-primary)] tabular-nums" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.5rem)", wordBreak: "break-word", overflowWrap: "anywhere" }}>{value}</div>
      {sub && <div className="text-[9px] min-[480px]:text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-0.5 sm:mt-1 truncate">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TABLE
   ═══════════════════════════════════════════════════ */

function DataTable({ headers, rows, highlightLast = false }: {
  headers: string[]; rows: (string | number)[][]; highlightLast?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)", WebkitOverflowScrolling: "touch" }}>
      <table className="w-full text-[11px] sm:text-[12px] md:text-[13px]" style={{ minWidth: "320px" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
            {headers.map((h) => (
              <th key={h} className="text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap" style={{ padding: "clamp(8px, 1.5vw, 14px) clamp(8px, 1.5vw, 16px)", fontSize: "clamp(8px, 1.5vw, 10px)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{
              borderBottom: ri < rows.length - 1 ? "1px solid var(--border)" : "none",
              background: highlightLast && ri === rows.length - 1 ? "rgba(0,255,106,0.04)" : "transparent",
            }}>
              {row.map((cell, ci) => (
                <td key={ci} className={`${highlightLast && ri === rows.length - 1 ? "font-bold text-[var(--accent)]" : ci === 0 ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"} tabular-nums whitespace-nowrap`}
                  style={{ padding: "clamp(8px, 1.5vw, 14px) clamp(8px, 1.5vw, 16px)" }}>
                  {typeof cell === "number" ? cell.toLocaleString("ru-RU") : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HORIZONTAL PROGRESS BAR
   ═══════════════════════════════════════════════════ */

function MiniBar({ label, value, maxVal, color = "var(--accent)" }: { label: string; value: number; maxVal: number; color?: string }) {
  const anim = useAnimateOnView();
  const pct = (value / maxVal) * 100;
  return (
    <div ref={anim.ref} className="flex items-center gap-2 sm:gap-3">
      <span className="text-[11px] sm:text-[12px] text-[var(--text-secondary)] w-16 sm:w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full rounded-full" style={{
          width: anim.visible ? `${pct}%` : "0%",
          background: color,
          transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }} />
      </div>
      <span className="text-[11px] sm:text-[12px] text-[var(--text-muted)] tabular-nums w-8 sm:w-10 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RISK BADGE
   ═══════════════════════════════════════════════════ */

function RiskBadge({ level, label }: { level: "high" | "medium" | "low"; label: string }) {
  const map = {
    high: { bg: "rgba(255,80,80,0.12)", color: "#ff5050", border: "rgba(255,80,80,0.25)" },
    medium: { bg: "rgba(255,180,0,0.12)", color: "#ffb400", border: "rgba(255,180,0,0.25)" },
    low: { bg: "rgba(0,255,106,0.08)", color: "var(--accent)", border: "rgba(0,255,106,0.15)" },
  };
  const s = map[level];
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════
   EMAIL SUBSCRIBE
   ═══════════════════════════════════════════════════ */

function EmailSubscribe() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setEmail("");
  };

  return (
    <div className="rounded-xl sm:rounded-2xl" style={{
      padding: "clamp(16px, 3vw, 24px)",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      marginBottom: "clamp(24px, 4vw, 36px)",
    }}>
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} className="text-[var(--accent)]" />
        <h3 className="text-[13px] sm:text-sm font-semibold text-[var(--text-primary)]">
          {t("Получать отчёты на почту", "Receive reports by email")}
        </h3>
      </div>
      <p className="text-[12px] text-[var(--text-muted)] mb-4 leading-relaxed">
        {t(
          "Оставьте email — будем отправлять квартальные финансовые отчёты и обновления Atlas Secure.",
          "Leave your email — we'll send quarterly financial reports and Atlas Secure updates."
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col min-[480px]:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("your@email.com", "your@email.com")}
          className="flex-1 rounded-lg text-[13px] sm:text-sm outline-none transition-all duration-300 focus:border-[var(--accent)]"
          style={{
            padding: "clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 16px)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          required
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 shrink-0"
          style={{
            padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)",
            background: sent ? "rgba(0,255,106,0.15)" : "var(--accent)",
            color: sent ? "var(--accent)" : "var(--bg-deep)",
            border: sent ? "1px solid var(--border-accent)" : "none",
            fontSize: "clamp(12px, 2vw, 14px)",
          }}
        >
          {sent ? (
            <><CheckCircle size={14} /> {t("Отправлено", "Sent")}</>
          ) : (
            <><Mail size={14} /> {t("Подписаться", "Subscribe")}</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AtlasReport() {
  const { t } = useI18n();

  const revenue = useCountUp(3891829, 2500);
  const netRevenue = useCountUp(3306829, 2500);
  const opex = useCountUp(585000, 2200);
  const growth = useCountUp(13.4, 2000, 1);

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(8,8,8,0.7)", borderBottom: "1px solid var(--border)" }}>
        <div className="w-full flex items-center justify-between gap-3 sm:gap-4" style={{ padding: "clamp(12px, 2vw, 18px) clamp(24px, 5vw, 64px)" }}>
          <a href="/" className="flex items-center gap-2 text-[13px] sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300 shrink-0">
            <ArrowLeft size={16} />
            <span className="hidden min-[480px]:inline">QoDev</span>
          </a>
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Shield size={16} className="text-[var(--accent)] shrink-0" />
            <span className="font-display font-bold text-[var(--text-primary)] text-[13px] sm:text-sm truncate">Atlas Secure</span>
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0" style={{ background: "rgba(0,255,106,0.1)", color: "var(--accent)", border: "1px solid rgba(0,255,106,0.15)" }}>Q1 2025</span>
          </div>
          <LangSwitcher />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto" style={{ padding: "clamp(24px, 5vw, 48px) clamp(24px, 5vw, 64px) clamp(48px, 8vw, 80px)" }}>

        {/* ═══ TITLE ═══ */}
        <div className="text-center" style={{ marginBottom: "clamp(32px, 5vw, 48px)" }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ boxShadow: "0 0 12px rgba(0,255,106,0.35)" }} />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">Financial Report</span>
          </div>
          <h1 className="font-display font-bold tracking-tight text-[var(--text-primary)]" style={{ fontSize: "clamp(1.5rem, 5vw, 2.75rem)", lineHeight: 1.1 }}>
            Atlas Secure VPN
          </h1>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: "clamp(0.825rem, 2vw, 1rem)", marginTop: "clamp(8px, 1.5vw, 12px)" }}>
            {t("Финансовый отчёт за I квартал 2025 · 1 января — 31 марта", "Financial Report Q1 2025 · January 1 — March 31")}
          </p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
            <Lock size={10} className="text-[var(--text-muted)] shrink-0 sm:w-3 sm:h-3" />
            <span className="text-[8px] sm:text-[10px] text-[var(--text-muted)] tracking-wider uppercase">{t("Конфиденциально · Atlas Secure", "Confidential · Atlas Secure")}</span>
          </div>
        </div>

        {/* ═══ TOP KPI STRIP ═══ */}
        <div ref={revenue.ref} className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "clamp(8px, 1.5vw, 14px)", marginBottom: "clamp(24px, 4vw, 40px)" }}>
          <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(0,255,106,0.08), rgba(0,255,106,0.02))", border: "1px solid var(--border-accent)" }}>
            <div style={{ padding: "clamp(12px, 2.5vw, 20px)" }}>
              <div className="text-[9px] min-[480px]:text-[10px] font-semibold tracking-wider uppercase text-[var(--accent)] mb-1.5 sm:mb-2">{t("Выручка", "Revenue")}</div>
              <div className="font-display font-bold text-[var(--text-primary)] tabular-nums" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.35rem)", overflowWrap: "anywhere" }}>
                {revenue.value.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[9px] min-[480px]:text-[10px] text-[var(--text-muted)] mt-1">Gross Revenue</div>
            </div>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, var(--accent), #00ccff)" }} />
          </div>

          <div ref={netRevenue.ref} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "clamp(12px, 2.5vw, 20px)" }}>
              <div className="text-[9px] min-[480px]:text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)] mb-1.5 sm:mb-2">{t("Чистая выручка", "Net Revenue")}</div>
              <div className="font-display font-bold text-[var(--text-primary)] tabular-nums" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.35rem)", overflowWrap: "anywhere" }}>
                {netRevenue.value.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[9px] min-[480px]:text-[10px] text-[var(--text-muted)] mt-1">EBITDA · 85.0%</div>
            </div>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #00ccff, rgba(0,204,255,0.3))" }} />
          </div>

          <div ref={opex.ref} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "clamp(12px, 2.5vw, 20px)" }}>
              <div className="text-[9px] min-[480px]:text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)] mb-1.5 sm:mb-2">{t("Опер. расходы", "Op. Expenses")}</div>
              <div className="font-display font-bold text-[var(--text-primary)] tabular-nums" style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.35rem)", overflowWrap: "anywhere" }}>
                {opex.value.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[9px] min-[480px]:text-[10px] text-[var(--text-muted)] mt-1">OpEx · 15.0%</div>
            </div>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, rgba(255,180,0,0.5), rgba(255,180,0,0.15))" }} />
          </div>

          <div ref={growth.ref} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "clamp(12px, 2.5vw, 20px)" }}>
              <div className="text-[9px] min-[480px]:text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)] mb-1.5 sm:mb-2">{t("Динамика М/М", "M/M Growth")}</div>
              <div className="font-display font-bold tabular-nums flex items-center gap-1.5" style={{ fontSize: "clamp(1rem, 3vw, 1.35rem)", color: "var(--accent)" }}>
                <TrendingUp size={16} />+{growth.value}%
              </div>
              <div className="text-[9px] min-[480px]:text-[10px] text-[var(--text-muted)] mt-1">{t("Март vs Январь", "March vs January")}</div>
            </div>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, var(--accent), rgba(0,255,106,0.15))" }} />
          </div>
        </div>

        {/* ═══ QUICK STATS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "clamp(8px, 2vw, 14px)", marginBottom: "clamp(24px, 4vw, 40px)" }}>
          <KpiCard label={t("Подписок", "Subscriptions")} value="9 183" sub="Paid subscribers" icon={<Users size={16} />} />
          <KpiCard label={t("Ср. чек", "Avg. Check")} value="423,50 ₽" sub="AOV" icon={<CreditCard size={16} />} />
          <KpiCard label="MRR" value="1 297 276 ₽" sub="Monthly Recurring" icon={<Activity size={16} />} accent />
          <KpiCard label={t("ARR прогноз", "ARR Forecast")} value={t("15,6 млн ₽", "15.6M ₽")} sub="Annual Recurring" icon={<Target size={16} />} />
        </div>

        {/* ═══ TELEGRAM CTA ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 12px)", marginBottom: "clamp(16px, 3vw, 24px)" }}>
          <a href="https://t.me/atlassecure_bot" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full font-semibold transition-all duration-300 text-[var(--bg-deep)] hover:opacity-90 rounded-xl"
            style={{ padding: "clamp(13px, 2.5vw, 16px) 24px", fontSize: "clamp(13px, 2vw, 15px)", background: "var(--accent)" }}>
            <Send size={16} /> {t("Подключить Atlas Secure", "Connect Atlas Secure")}
          </a>
          <a href="/atlas"
            className="flex items-center justify-center gap-2 w-full font-medium transition-all duration-300 hover:border-[var(--border-accent)] hover:text-[var(--accent)] rounded-xl"
            style={{ padding: "clamp(13px, 2.5vw, 16px) 24px", fontSize: "clamp(13px, 2vw, 15px)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            <Shield size={16} /> {t("Инструкция по настройке VPN", "VPN Setup Instructions")}
          </a>
        </div>

        {/* ═══ EMAIL INPUT ═══ */}
        <EmailSubscribe />

        {/* ═══ REPORT SECTIONS ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 16px)" }}>

          {/* 01 — EXECUTIVE SUMMARY */}
          <ReportSection id="01" icon={<BarChart3 size={20} className="text-[var(--accent)]" />} title="Executive Summary" badge={t("Ключевое", "Key")} defaultOpen>
            <div className="grid sm:grid-cols-2" style={{ gap: "clamp(16px, 3vw, 24px)" }}>
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)] mb-3">{t("Ключевые результаты", "Key Results")}</h4>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t(
                    <>За I квартал 2025 года Atlas Secure VPN продемонстрировал устойчивый рост пользовательской базы и выручки. Совокупная выручка составила <strong className="text-[var(--text-primary)]">3 891 829 ₽</strong> при операционной рентабельности <strong className="text-[var(--text-primary)]">85,0%</strong>. Маркетинговые инвестиции <strong className="text-[var(--text-primary)]">210 000 ₽</strong> обеспечили рост органического трафика на 47%.</>,
                    <>In Q1 2025, Atlas Secure VPN demonstrated steady growth in user base and revenue. Total revenue was <strong className="text-[var(--text-primary)]">3,891,829 ₽</strong> with an operating margin of <strong className="text-[var(--text-primary)]">85.0%</strong>. Marketing investments of <strong className="text-[var(--text-primary)]">210,000 ₽</strong> drove a 47% increase in organic traffic.</>
                  )}
                </p>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                  {t(
                    <><strong className="text-[var(--text-primary)]">60%</strong> транзакций — новые пользователи, <strong className="text-[var(--text-primary)]">40%</strong> — продления. Высокий уровень органического роста и удержания клиентов.</>,
                    <><strong className="text-[var(--text-primary)]">60%</strong> of transactions are new users, <strong className="text-[var(--text-primary)]">40%</strong> are renewals. High organic growth and customer retention.</>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)] mb-3">{t("Стратегический контекст", "Strategic Context")}</h4>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t(
                    <>Продукт функционирует на фоне ужесточения регуляторной среды (РКН/ТСПУ). Технический стек на базе <strong className="text-[var(--text-primary)]">VLESS + XTLS-Reality</strong> обеспечивает устойчивую обходимость блокировок.</>,
                    <>The product operates amid a tightening regulatory environment. The technical stack based on <strong className="text-[var(--text-primary)]">VLESS + XTLS-Reality</strong> ensures reliable circumvention of blocks.</>
                  )}
                </p>
                <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                  {t(
                    "Диверсификация платёжных методов (карта, СБП, SberPay, крипто) снижает операционные риски и повышает конверсию.",
                    "Diversification of payment methods (card, instant bank transfer, SberPay, crypto) reduces operational risks and improves conversion."
                  )}
                </p>
              </div>
            </div>
          </ReportSection>

          {/* 02 — REVENUE ANALYSIS */}
          <ReportSection id="02" icon={<DollarSign size={20} className="text-[var(--accent)]" />} title={t("Анализ выручки", "Revenue Analysis")} badge="Revenue">
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("Выручка по месяцам", "Revenue by Month")}</h4>
            <BarChart
              maxValue={1400000}
              data={[
                { label: t("Январь 2025", "January 2025"), value: 1224235, subLabel: "31.5%" },
                { label: t("Февраль 2025", "February 2025"), value: 1279893, subLabel: "32.9%" },
                { label: t("Март 2025", "March 2025"), value: 1387701, subLabel: "35.6%" },
              ]}
            />

            <div className="h-[1px]" style={{ background: "var(--border)" }} />

            <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("Структура по тарифам", "Plan Structure")}</h4>
            <DataTable
              headers={[t("Тариф", "Plan"), t("Доля", "Share"), t("Подписок", "Subs"), t("Ср. чек", "Avg."), t("Выручка", "Revenue")]}
              rows={[
                [t("1 месяц", "1 month"), "40%", "3 673", "199 ₽", "730 927 ₽"],
                [t("3 месяца", "3 months"), "35%", "3 214", "449 ₽", "1 443 086 ₽"],
                [t("6 месяцев", "6 months"), "15%", "1 377", "799 ₽", "1 099 623 ₽"],
                [t("12 месяцев", "12 months"), "10%", "918", "1 299 ₽", "618 193 ₽"],
                [t("ИТОГО", "TOTAL"), "100%", "9 183", "423,50 ₽", "3 891 829 ₽"],
              ]}
              highlightLast
            />
          </ReportSection>

          {/* 03 — PAYMENT METHODS */}
          <ReportSection id="03" icon={<Wallet size={20} className="text-[var(--accent)]" />} title={t("Платёжные методы", "Payment Methods")} badge="Payments">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-start" style={{ gap: "clamp(16px, 4vw, 40px)" }}>
              <DonutChart
                totalLabel={t("Всего", "Total")}
                segments={[
                  { label: t("Карта", "Card"), value: 40, color: "#00ff6a" },
                  { label: t("СБП", "SBP"), value: 30, color: "#00ccff" },
                  { label: t("Крипто", "Crypto"), value: 15, color: "#ffb400" },
                  { label: "SberPay", value: 15, color: "#9966ff" },
                ]}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 14px)" }}>
                <MiniBar label={t("Карта", "Card")} value={40} maxVal={100} color="#00ff6a" />
                <MiniBar label={t("СБП", "SBP")} value={30} maxVal={100} color="#00ccff" />
                <MiniBar label={t("Крипто", "Crypto")} value={15} maxVal={100} color="#ffb400" />
                <MiniBar label="SberPay" value={15} maxVal={100} color="#9966ff" />

                <div className="rounded-xl mt-2" style={{ padding: "clamp(12px, 2vw, 16px)", background: "rgba(255,180,0,0.04)", border: "1px solid rgba(255,180,0,0.15)" }}>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                    {t(
                      <><strong style={{ color: "#ffb400" }}>15% крипто-платежей</strong> — значительно выше среднего по рынку (3–5%). Сигнализирует о технически грамотной аудитории.</>,
                      <><strong style={{ color: "#ffb400" }}>15% crypto payments</strong> — significantly above the market average (3–5%). Indicates a technically savvy audience.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </ReportSection>

          {/* 04 — COHORT ANALYSIS */}
          <ReportSection id="04" icon={<Users size={20} className="text-[var(--accent)]" />} title={t("Когортный анализ", "Cohort Analysis")} badge="Retention">
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "clamp(6px, 2vw, 12px)" }}>
              <KpiCard label={t("Новые", "New")} value="5 510" sub={t("60% транзакций", "60% of transactions")} icon={<TrendingUp size={14} />} accent />
              <KpiCard label={t("Продления", "Renewals")} value="3 673" sub="40% retention" icon={<Users size={14} />} />
              <KpiCard label={t("Выручка (новые)", "Revenue (new)")} value="2 335 097 ₽" sub={t("60% от общей", "60% of total")} icon={<DollarSign size={14} />} />
              <KpiCard label={t("Выручка (рекурр)", "Revenue (recurring)")} value="1 556 732 ₽" sub={t("40% рекуррентная", "40% recurring")} icon={<Activity size={14} />} />
            </div>

            <div className="grid sm:grid-cols-3" style={{ gap: "clamp(10px, 2vw, 16px)" }}>
              <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 20px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)] mb-2">Acquisition Rate</h5>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{t("5 510 новых подписчиков за квартал формируют будущую когорту для продлений.", "5,510 new subscribers per quarter form the future cohort for renewals.")}</p>
              </div>
              <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 20px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)] mb-2">Retention Rate</h5>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{t("40% продлений при базе < 4 кварталов — сильный показатель. Benchmark SaaS: 30–40%.", "40% renewals with a base < 4 quarters — a strong indicator. SaaS benchmark: 30–40%.")}</p>
              </div>
              <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 20px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)] mb-2">{t("LTV потенциал", "LTV Potential")}</h5>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{t(<>LTV ≈ 423,50 × 1,67 ≈ <strong className="text-[var(--text-primary)]">707 ₽</strong> / пользователь при 1-мес. циклах.</>, <>LTV ≈ 423.50 × 1.67 ≈ <strong className="text-[var(--text-primary)]">707 ₽</strong> / user at 1-month cycles.</>)}</p>
              </div>
            </div>
          </ReportSection>

          {/* 05 — P&L */}
          <ReportSection id="05" icon={<BarChart3 size={20} className="text-[var(--accent)]" />} title={t("Отчёт о прибылях и убытках", "Profit & Loss Statement")} badge="P&L">
            <DataTable
              headers={[t("Статья", "Item"), t("За квартал", "Per Quarter"), t("В месяц (avg)", "Per Month (avg)")]}
              rows={[
                [t("Валовая выручка", "Gross Revenue"), "3 891 829 ₽", "1 297 276 ₽"],
                [t("Серверы (VPS, трафик)", "Servers (VPS, traffic)"), "(180 000 ₽)", "(60 000 ₽)"],
                [t("Разработка и поддержка", "Development & support"), "(90 000 ₽)", "(30 000 ₽)"],
                [t("Маркетинг и реклама", "Marketing & advertising"), "(210 000 ₽)", "(70 000 ₽)"],
                [t("Платёжные комиссии (~1.1%)", "Payment fees (~1.1%)"), "(42 810 ₽)", "(14 270 ₽)"],
                [t("Прочие опер. расходы", "Other op. expenses"), "(62 190 ₽)", "(20 730 ₽)"],
                [t("Итого OpEx", "Total OpEx"), "(585 000 ₽)", "(195 000 ₽)"],
                ["EBITDA", "3 306 829 ₽", "1 102 276 ₽"],
              ]}
              highlightLast
            />

            <div className="grid sm:grid-cols-2" style={{ gap: "clamp(10px, 2vw, 16px)" }}>
              <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 20px)", background: "rgba(0,255,106,0.04)", border: "1px solid rgba(0,255,106,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-[var(--accent)]" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)]">EBITDA Margin</span>
                </div>
                <div className="font-display font-bold text-[var(--accent)]" style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>85,0%</div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">{t("Высокий для SaaS с маркет. инвестициями", "High for SaaS with marketing investments")}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--text-muted)]">{t("Структура расходов", "Expense Structure")}</h5>
                <MiniBar label={t("Маркетинг", "Marketing")} value={210000} maxVal={585000} color="#ff6b9d" />
                <MiniBar label={t("Серверы", "Servers")} value={180000} maxVal={585000} color="#00ccff" />
                <MiniBar label={t("Разработка", "Development")} value={90000} maxVal={585000} color="var(--accent)" />
                <MiniBar label={t("Комиссии", "Fees")} value={42810} maxVal={585000} color="#ffb400" />
                <MiniBar label={t("Прочие", "Other")} value={62190} maxVal={585000} color="#9966ff" />
              </div>
            </div>
          </ReportSection>

          {/* 06 — KPI & METRICS */}
          <ReportSection id="06" icon={<Activity size={20} className="text-[var(--accent)]" />} title={t("Ключевые метрики", "Key Metrics")} badge="KPI">
            <DataTable
              headers={[t("Метрика", "Metric"), t("Значение Q1", "Q1 Value"), t("Интерпретация", "Interpretation")]}
              rows={[
                ["MRR", "1 297 276 ₽", t("Устойчивый базис", "Stable basis")],
                ["ARR", "15 567 316 ₽", t("Прогноз на 12 мес", "12-month forecast")],
                ["AOV", "423,50 ₽", t("Выше 1-мес. тарифа", "Above 1-month plan")],
                ["CAC", "~106 ₽", t("OpEx / новых юзеров", "OpEx / new users")],
                ["LTV", "~707 ₽", t("При retention 40%", "At 40% retention")],
                ["LTV / CAC", "6,7×", t("Отлично (>3× норма)", "Excellent (>3× norm)")],
                ["Churn Rate", t("~60% / квартал", "~60% / quarter"), t("Целевое снижение — Q2", "Target reduction — Q2")],
                ["Gross Margin", "85,0%", t("Высокий для SaaS", "High for SaaS")],
                [t("Revenue Growth (М/М)", "Revenue Growth (M/M)"), "+13,4%", t("Положительный тренд", "Positive trend")],
                [t("Транзакций/день", "Transactions/day"), "~102", t("9 183 / 90 дней", "9,183 / 90 days")],
                [t("Доля крипто", "Crypto share"), "15%", t("3–5× выше рынка", "3–5× above market")],
                [t("Долгосрочные планы", "Long-term plans"), "25%", t("Снижает churn", "Reduces churn")],
              ]}
            />
          </ReportSection>

          {/* 07 — UNIT ECONOMICS */}
          <ReportSection id="07" icon={<Zap size={20} className="text-[var(--accent)]" />} title="Unit Economics">
            <div className="grid sm:grid-cols-2" style={{ gap: "clamp(12px, 2vw, 16px)" }}>
              <div className="rounded-xl" style={{ padding: "clamp(16px, 3vw, 24px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)] mb-4">{t("Экономика привлечения", "Acquisition Economics")}</h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    [t("Расходы / квартал", "Expenses / quarter"), "585 000 ₽"],
                    [t("Новых пользователей", "New users"), "5 510"],
                    ["CAC", "106 ₽"],
                    ["Payback Period", t("< 1 мес", "< 1 month")],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--text-secondary)]">{k}</span>
                      <span className="text-[13px] font-bold text-[var(--text-primary)] tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl" style={{ padding: "clamp(16px, 3vw, 24px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                <h5 className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)] mb-4">{t("Экономика удержания", "Retention Economics")}</h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    ["Retention Rate", "40%"],
                    [t("LTV (оценка)", "LTV (estimate)"), "707 ₽"],
                    ["LTV / CAC", "6,7×"],
                    [t("Рекуррентная выручка", "Recurring revenue"), "40%"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[12px] text-[var(--text-secondary)]">{k}</span>
                      <span className="text-[13px] font-bold text-[var(--text-primary)] tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ReportSection>

          {/* 08 — MARKETING INTEGRATIONS */}
          <ReportSection id="08" icon={<Megaphone size={20} className="text-[var(--accent)]" />} title={t("Маркетинг и интеграции", "Marketing & Integrations")} badge="Marketing">
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "clamp(6px, 2vw, 12px)" }}>
              <KpiCard label={t("Расход на маркетинг", "Marketing spend")} value="210 000 ₽" sub={t("70 000 ₽/мес", "70,000 ₽/mo")} icon={<Megaphone size={14} />} accent />
              <KpiCard label={t("CPA (привлечение)", "CPA (acquisition)")} value="38 ₽" sub={t("Маркет. расход / юзер", "Marketing cost / user")} icon={<Target size={14} />} />
              <KpiCard label="ROAS" value="18,5×" sub={t("Возврат на рекл. расходы", "Return on ad spend")} icon={<TrendingUp size={14} />} />
              <KpiCard label={t("Органический рост", "Organic growth")} value="+47%" sub="Q1 vs Q4 2024" icon={<Share2 size={14} />} />
            </div>

            <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("Распределение бюджета по каналам", "Budget Distribution by Channel")}</h4>
            <DataTable
              headers={[t("Канал", "Channel"), t("Бюджет Q1", "Q1 Budget"), t("В мес", "Per Mo"), t("Привлечено", "Acquired"), "CPA", "Conv."]}
              rows={[
                ["Telegram Ads", "78 000 ₽", "26 000 ₽", "2 106", "37 ₽", "4,2%"],
                [t("Яндекс.Директ", "Yandex.Direct"), "48 000 ₽", "16 000 ₽", "918", "52 ₽", "2,8%"],
                [t("YouTube интеграции", "YouTube integrations"), "36 000 ₽", "12 000 ₽", "1 432", "25 ₽", "6,1%"],
                [t("Реферальная программа", "Referral programme"), "24 000 ₽", "8 000 ₽", "826", "29 ₽", "8,3%"],
                [t("Контент и SEO", "Content & SEO"), "15 000 ₽", "5 000 ₽", "156", "96 ₽", "1,2%"],
                [t("Прочие (ASO, PR)", "Other (ASO, PR)"), "9 000 ₽", "3 000 ₽", "72", "125 ₽", "0,9%"],
                [t("ИТОГО", "TOTAL"), "210 000 ₽", "70 000 ₽", "5 510", "38 ₽", "3,8%"],
              ]}
              highlightLast
            />

            <div className="grid sm:grid-cols-2" style={{ gap: "clamp(12px, 2vw, 16px)" }}>
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)] mb-3">{t("Эффективность каналов", "Channel Efficiency")}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <MiniBar label="Telegram" value={78000} maxVal={210000} color="#00ccff" />
                  <MiniBar label={t("Яндекс", "Yandex")} value={48000} maxVal={210000} color="#ffb400" />
                  <MiniBar label="YouTube" value={36000} maxVal={210000} color="#ff6b9d" />
                  <MiniBar label={t("Рефералы", "Referrals")} value={24000} maxVal={210000} color="var(--accent)" />
                  <MiniBar label="SEO" value={15000} maxVal={210000} color="#9966ff" />
                  <MiniBar label={t("Прочие", "Other")} value={9000} maxVal={210000} color="rgba(255,255,255,0.3)" />
                </div>
              </div>
              <div>
                <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)] mb-3">{t("Ключевые интеграции", "Key Integrations")}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 12px)" }}>
                  {[
                    { name: "Telegram Bot + Mini App", status: t("Активно", "Active"), desc: t("Автоматизация подписок, бот поддержки, push-уведомления. Конверсия в покупку 12,4%.", "Subscription automation, support bot, push notifications. Purchase conversion 12.4%.") },
                    { name: t("Партнёрская сеть", "Partner Network"), status: t("Активно", "Active"), desc: t("18 активных партнёров. Реферальный бонус 15% от первой оплаты. LTV рефералов на 23% выше.", "18 active partners. Referral bonus 15% of first payment. Referral LTV 23% higher.") },
                    { name: "App Store Optimization", status: t("В работе", "In Progress"), desc: t("A/B-тесты иконок и скриншотов. Органические установки +31% за Q1.", "A/B tests of icons and screenshots. Organic installs +31% in Q1.") },
                    { name: t("Email-маркетинг", "Email Marketing"), status: t("Планируется", "Planned"), desc: t("Автоматические цепочки для реактивации churned-юзеров. Ожидаемый возврат 8–12%.", "Automated chains for reactivating churned users. Expected return 8–12%.") },
                  ].map((item) => (
                    <div key={item.name} className="rounded-lg sm:rounded-xl" style={{ padding: "clamp(10px, 2vw, 16px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                        <span className="text-[12px] sm:text-[13px] font-semibold text-[var(--text-primary)]">{item.name}</span>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider"
                          style={{
                            background: item.status === t("Активно", "Active") ? "rgba(0,255,106,0.08)" : item.status === t("В работе", "In Progress") ? "rgba(0,204,255,0.08)" : "rgba(255,180,0,0.08)",
                            color: item.status === t("Активно", "Active") ? "var(--accent)" : item.status === t("В работе", "In Progress") ? "#00ccff" : "#ffb400",
                            border: `1px solid ${item.status === t("Активно", "Active") ? "rgba(0,255,106,0.15)" : item.status === t("В работе", "In Progress") ? "rgba(0,204,255,0.15)" : "rgba(255,180,0,0.15)"}`,
                          }}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 20px)", background: "rgba(0,255,106,0.04)", border: "1px solid rgba(0,255,106,0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-[var(--accent)]" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("ROI маркетинга", "Marketing ROI")}</span>
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {t(
                  <>Каждый рубль, вложенный в маркетинг, приносит <strong className="text-[var(--text-primary)]">18,5 ₽ выручки</strong>. Наиболее эффективный канал — YouTube-интеграции (CPA 25 ₽, конверсия 6,1%). Реферальная программа показывает самый высокий conv. rate (8,3%) и LTV на 23% выше среднего. Рекомендация на Q2: увеличить бюджет YouTube и реферальной программы на 40%.</>,
                  <>Every rouble invested in marketing generates <strong className="text-[var(--text-primary)]">18.5 ₽ in revenue</strong>. The most effective channel is YouTube integrations (CPA 25 ₽, conversion 6.1%). The referral programme shows the highest conversion rate (8.3%) and LTV 23% above average. Q2 recommendation: increase YouTube and referral programme budgets by 40%.</>
                )}
              </p>
            </div>
          </ReportSection>

          {/* 09 — RISKS & FORECAST */}
          <ReportSection id="09" icon={<AlertTriangle size={20} className="text-[var(--accent)]" />} title={t("Риски и прогноз Q2", "Risks & Q2 Forecast")} badge="Forecast">
            <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("Матрица рисков", "Risk Matrix")}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 1.5vw, 12px)" }}>
              {[
                { risk: t("Блокировка протоколов РКН/ТСПУ", "Protocol blocking by regulators"), level: "high" as const, label: t("Высокий", "High"), action: t("XTLS-Reality + ротация SNI, cascade-мост через Yandex Cloud", "XTLS-Reality + SNI rotation, cascade bridge via Yandex Cloud") },
                { risk: t("Ограничения платёжных провайдеров", "Payment provider restrictions"), level: "medium" as const, label: t("Средний", "Medium"), action: t("Диверсификация: 4 метода оплаты, крипто-буфер", "Diversification: 4 payment methods, crypto buffer") },
                { risk: t("Высокий Churn Rate", "High Churn Rate"), level: "medium" as const, label: t("Средний", "Medium"), action: t("Стимулирование долгосрочных планов, реферальная программа", "Incentivising long-term plans, referral programme") },
                { risk: t("Инфраструктурные сбои VPS", "VPS infrastructure failures"), level: "low" as const, label: t("Низкий", "Low"), action: t("Multi-server архитектура, Netcup + резерв (failover)", "Multi-server architecture, Netcup + backup (failover)") },
              ].map((r) => (
                <div key={r.risk} className="rounded-xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" style={{ padding: "clamp(12px, 2vw, 16px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                  <RiskBadge level={r.level} label={r.label} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--text-primary)]">{r.risk}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{r.action}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px]" style={{ background: "var(--border)" }} />

            <h4 className="text-[12px] font-bold tracking-wider uppercase text-[var(--accent)]">{t("Прогноз на Q2 2025", "Q2 2025 Forecast")}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "clamp(6px, 2vw, 12px)" }}>
              <KpiCard label={t("Выручка Q2", "Q2 Revenue")} value={t("4,3–4,6 млн ₽", "4.3–4.6M ₽")} sub={t("+10–18% к Q1", "+10–18% vs Q1")} icon={<TrendingUp size={14} />} accent />
              <KpiCard label={t("База подписок", "Subscription base")} value="10 500+" sub={t("Целевая за квартал", "Quarter target")} icon={<Users size={14} />} />
              <KpiCard label={t("Целевая маржа", "Target margin")} value="91–92%" sub={t("Оптимизация инфры", "Infrastructure opt.")} icon={<BarChart3 size={14} />} />
              <KpiCard label={t("MRR цель", "MRR Target")} value={t("1,45 млн ₽", "1.45M ₽")} sub="Monthly Recurring" icon={<Target size={14} />} />
            </div>
          </ReportSection>

        </div>

        {/* ═══ LEGAL FOOTER ═══ */}
        <div className="text-center" style={{ marginTop: "clamp(32px, 5vw, 48px)", paddingTop: "clamp(16px, 3vw, 24px)", borderTop: "1px solid var(--border)" }}>
          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] leading-relaxed">
            <span className="text-[var(--accent)]">&copy;</span> {new Date().getFullYear()} QoDev Limited &middot; Level 15, The Hong Kong Club Building, 3A Chater Road, Central, Hong Kong
          </p>
        </div>
      </main>
    </div>
  );
}
