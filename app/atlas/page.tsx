"use client";

import { useState } from "react";
import {
  ArrowLeft, Monitor, Smartphone, Tv, Wifi, Shield, Copy, Check,
  AlertTriangle, Terminal, ChevronRight, ChevronDown, ChevronUp,
  Globe, Laptop, Send, Download, MessageCircle, QrCode, Key,
  Settings, Play, CheckCircle, Zap, ExternalLink, ClipboardPaste,
  Share2, ScanLine, Apple,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   SANITIZED EXAMPLE CONFIG
   ═══════════════════════════════════════════════════ */

const EXAMPLE_CONFIG = `{
  "outbounds": [
    {
      "protocol": "vless",
      "tag": "proxy",
      "settings": {
        "address": "***.***.**.***",
        "port": "****",
        "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "flow": "xtls-rprx-vision",
        "encryption": "none"
      },
      "streamSettings": {
        "security": "reality",
        "network": "***",
        "realitySettings": {
          "serverName": "*****.***",
          "publicKey": "************************************",
          "shortId": "********",
          "fingerprint": "chrome"
        }
      }
    },
    { "protocol": "freedom", "tag": "direct" },
    { "protocol": "blackhole", "tag": "block" }
  ],
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "listen": "[::1]",
      "port": "****",
      "sniffing": { "enabled": true }
    }
  ],
  "remarks": "Atlas Secure"
}`;

/* ═══════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-300 shrink-0"
      style={{ background: copied ? "rgba(0,255,106,0.15)" : "rgba(255,255,255,0.06)", color: copied ? "var(--accent)" : "var(--text-muted)", border: `1px solid ${copied ? "var(--border-accent)" : "var(--border)"}` }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span className="hidden sm:inline">{copied ? "Скопировано" : "Копировать"}</span>
    </button>
  );
}

function WarningBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 sm:gap-3 rounded-xl" style={{ padding: "clamp(12px, 3vw, 18px)", background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.2)" }}>
      <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#ffb400" }} />
      <div className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,180,0,0.9)" }}>{children}</div>
    </div>
  );
}

function InfoBlock({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 sm:gap-3 rounded-xl" style={{ padding: "clamp(12px, 3vw, 18px)", background: "rgba(0,255,106,0.04)", border: "1px solid rgba(0,255,106,0.15)" }}>
      {icon || <Globe size={18} className="shrink-0 mt-0.5 text-[var(--accent)]" />}
      <div className="text-[13px] sm:text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}

function CodeBlock({ title, code, copyable = true }: { title?: string; code: string; copyable?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "#0d0d0d" }}>
      {title && (
        <div className="flex items-center justify-between gap-2" style={{ padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2 min-w-0">
            <Terminal size={13} className="text-[var(--accent)] shrink-0" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)] truncate">{title}</span>
          </div>
          {copyable && <CopyButton text={code} />}
        </div>
      )}
      <pre className="overflow-x-auto" style={{ padding: "clamp(12px, 3vw, 20px)", margin: 0, WebkitOverflowScrolling: "touch" }}>
        <code className="text-[11px] sm:text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'SF Mono','Fira Code','JetBrains Mono',monospace", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>{code}</code>
      </pre>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NUMBERED STEP (inline within accordion)
   ═══════════════════════════════════════════════════ */

function NumStep({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] sm:text-[13px] font-bold font-display"
        style={{ background: "rgba(0,255,106,0.12)", color: "var(--accent)", border: "1px solid rgba(0,255,106,0.2)" }}>
        {num}
      </div>
      <div className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-0.5 sm:pt-1 min-w-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACCORDION SECTION
   ═══════════════════════════════════════════════════ */

function AccordionSection({ icon, title, open, onToggle, children }: {
  icon: React.ReactNode; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl sm:rounded-2xl transition-all duration-300" style={{
      background: "var(--bg-card)",
      border: open ? "1px solid var(--border-accent)" : "1px solid var(--border)",
    }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 sm:gap-4 text-left" style={{ padding: "clamp(14px, 3vw, 22px) clamp(14px, 3vw, 24px)" }}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,106,0.06)", border: "1px solid var(--border)" }}>
          {icon}
        </div>
        <span className="flex-1 font-display font-semibold text-[var(--text-primary)] min-w-0" style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.05rem)" }}>{title}</span>
        {open
          ? <ChevronUp size={18} className="text-[var(--accent)] shrink-0" />
          : <ChevronDown size={18} className="text-[var(--text-muted)] shrink-0" />
        }
      </button>
      <div className="overflow-hidden transition-all duration-400" style={{ maxHeight: open ? "5000px" : "0", opacity: open ? 1 : 0 }}>
        <div style={{ padding: "clamp(4px, 1vw, 8px) clamp(14px, 3vw, 24px) clamp(16px, 3vw, 24px)", display: "flex", flexDirection: "column", gap: "clamp(10px, 2.5vw, 18px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUB-HEADING inside accordion
   ═══════════════════════════════════════════════════ */

function SubHeading({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
      {icon}
      <h4 className="text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--accent)" }}>{children}</h4>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP CARD (for router guide)
   ═══════════════════════════════════════════════════ */

function StepCard({ num, title, badge, children }: { num: number; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl" style={{ padding: "clamp(14px, 3vw, 24px)", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
      <div className="flex items-start gap-2.5 sm:gap-3" style={{ marginBottom: "clamp(12px, 2.5vw, 16px)" }}>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] sm:text-[13px] font-bold font-display"
          style={{ background: "linear-gradient(135deg, var(--accent), #00ccff)", color: "var(--bg-deep)" }}>
          {num}
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0 pt-0.5">
          <h3 className="font-display font-semibold text-[var(--text-primary)]" style={{ fontSize: "clamp(0.825rem, 2.5vw, 1rem)" }}>{title}</h3>
          {badge && (
            <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider"
              style={{ background: "rgba(0,255,106,0.12)", color: "var(--accent)", border: "1px solid rgba(0,255,106,0.2)" }}>
              {badge}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 12px)" }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function AtlasPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(8,8,8,0.6)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-[900px] mx-auto flex items-center justify-between" style={{ padding: "clamp(12px, 2vw, 14px) clamp(16px, 4vw, 32px)" }}>
          <a href="/" className="flex items-center gap-2 text-[13px] sm:text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">На главную</span>
          </a>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[var(--accent)]" />
            <span className="font-display font-bold text-[var(--text-primary)] text-[13px] sm:text-sm">Atlas Secure</span>
          </div>
          <div className="hidden sm:block" style={{ width: "72px" }} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[900px] mx-auto" style={{ padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px) clamp(48px, 8vw, 80px)" }}>

        {/* Title */}
        <div style={{ marginBottom: "clamp(24px, 4vw, 32px)" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "clamp(10px, 2vw, 16px)" }}>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" style={{ boxShadow: "0 0 12px rgba(0,255,106,0.35)" }} />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">Инструкции</span>
          </div>
          <h1 className="font-display font-bold tracking-tight text-[var(--text-primary)]" style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)", lineHeight: 1.15 }}>
            Как подключить VPN
          </h1>
          <p className="text-[var(--text-secondary)]" style={{ fontSize: "clamp(0.825rem, 2vw, 1rem)", marginTop: "clamp(8px, 1.5vw, 12px)" }}>
            Пошаговые инструкции для всех устройств
          </p>
        </div>

        {/* Accordion Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 14px)" }}>

          {/* ═══ TV ═══ */}
          <AccordionSection
            icon={<Tv size={20} className="text-[var(--accent)]" />}
            title="Установка на телевизор"
            open={openSection === "tv"}
            onToggle={() => toggle("tv")}
          >
            <NumStep num={1}>
              Установите приложение <strong className="text-[var(--text-primary)]">V2RayTun</strong> на телефон из{" "}
              <strong className="text-[var(--text-primary)]">App Store</strong> или{" "}
              <strong className="text-[var(--text-primary)]">Google Play</strong>
            </NumStep>
            <NumStep num={2}>
              На телевизоре откройте магазин приложений и установите{" "}
              <strong className="text-[var(--text-primary)]">V2RayTun</strong>
            </NumStep>
            <NumStep num={3}>
              Откройте V2RayTun на телевизоре и нажмите{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Добавить по QR&raquo;</strong>
            </NumStep>
            <NumStep num={4}>
              На телефоне в приложении V2RayTun нажмите{" "}
              <strong className="text-[var(--text-primary)]">+</strong> в правом верхнем углу →{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Сканировать QR&raquo;</strong>
            </NumStep>
            <NumStep num={5}>
              Отсканируйте QR-код с экрана телевизора — подписка добавится автоматически
            </NumStep>
            <InfoBlock icon={<QrCode size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
              <strong className="text-[var(--text-primary)]">Совет:</strong> Убедитесь, что телефон и телевизор находятся в одной Wi-Fi сети для корректного сканирования QR-кода.
            </InfoBlock>
          </AccordionSection>

          {/* ═══ COMPUTER ═══ */}
          <AccordionSection
            icon={<Monitor size={20} className="text-[var(--accent)]" />}
            title="Установка на компьютер"
            open={openSection === "computer"}
            onToggle={() => toggle("computer")}
          >
            <SubHeading icon={<Zap size={14} className="text-[var(--accent)]" />}>Через Telegram (быстрый способ)</SubHeading>
            <NumStep num={1}>
              Откройте <strong className="text-[var(--text-primary)]">Telegram</strong> на компьютере
            </NumStep>
            <NumStep num={2}>
              Перейдите в бот <strong className="text-[var(--text-primary)]">Atlas</strong> и нажмите{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Подключиться&raquo;</strong>
            </NumStep>
            <NumStep num={3}>
              Нажмите <strong className="text-[var(--text-primary)]">&laquo;Подключиться&raquo;</strong> ещё раз — конфигурация автоматически добавится в V2RayTun
            </NumStep>

            <div className="h-[1px]" style={{ background: "var(--border)", margin: "4px 0" }} />

            <SubHeading icon={<Download size={14} className="text-[var(--accent)]" />}>Через установку приложения</SubHeading>
            <NumStep num={1}>
              Перейдите в бот <strong className="text-[var(--text-primary)]">Atlas</strong> → раздел{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Инструкция&raquo;</strong>
            </NumStep>
            <NumStep num={2}>
              Скачайте и установите <strong className="text-[var(--text-primary)]">V2RayTun</strong> для вашей ОС (Windows или macOS)
            </NumStep>
            <NumStep num={3}>
              Следуйте инструкциям в боте для добавления подписки — вставьте ссылку через{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Импорт из буфера обмена&raquo;</strong>
            </NumStep>

            <InfoBlock icon={<MessageCircle size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
              <strong className="text-[var(--text-primary)]">Рекомендуем</strong> быстрый способ через Telegram — конфигурация добавляется за 2 клика без ручного копирования ключей.
            </InfoBlock>
          </AccordionSection>

          {/* ═══ ANOTHER PHONE ═══ */}
          <AccordionSection
            icon={<Smartphone size={20} className="text-[var(--accent)]" />}
            title="Установка на другой телефон"
            open={openSection === "phone"}
            onToggle={() => toggle("phone")}
          >
            <NumStep num={1}>
              Установите <strong className="text-[var(--text-primary)]">V2RayTun</strong> на втором телефоне из{" "}
              <strong className="text-[var(--text-primary)]">App Store</strong> или{" "}
              <strong className="text-[var(--text-primary)]">Google Play</strong>
            </NumStep>
            <NumStep num={2}>
              На этом устройстве откройте мини-приложение{" "}
              <strong className="text-[var(--text-primary)]">Atlas</strong> в Telegram
            </NumStep>
            <NumStep num={3}>
              Нажмите <strong className="text-[var(--text-primary)]">&laquo;Настроить другое устройство&raquo;</strong> и скопируйте ключ
            </NumStep>
            <NumStep num={4}>
              Передайте ключ на второй телефон (через мессенджер, заметки, AirDrop и т.д.)
            </NumStep>
            <NumStep num={5}>
              На втором телефоне откройте <strong className="text-[var(--text-primary)]">V2RayTun</strong>, нажмите{" "}
              <strong className="text-[var(--text-primary)]">+</strong> →{" "}
              <strong className="text-[var(--text-primary)]">&laquo;Вставить из буфера обмена&raquo;</strong> и разрешите вставку
            </NumStep>

            <InfoBlock icon={<Key size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
              <strong className="text-[var(--text-primary)]">Безопасность:</strong> Ключ подписки содержит ваши данные подключения. Не передавайте его посторонним — используйте только для своих устройств.
            </InfoBlock>
          </AccordionSection>

          {/* ═══ ROUTER ═══ */}
          <AccordionSection
            icon={<Wifi size={20} className="text-[var(--accent)]" />}
            title="Установка на роутер"
            open={openSection === "router"}
            onToggle={() => toggle("router")}
          >
            <InfoBlock icon={<Shield size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
              <strong className="text-[var(--text-primary)]">Защита всей сети:</strong> После настройки VPN на роутере все устройства в домашней сети будут автоматически защищены — телефоны, планшеты, ноутбуки, умные устройства.
            </InfoBlock>

            <StepCard num={1} title="Определите модель роутера">
              <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Проверьте, поддерживает ли ваш роутер прошивку <strong className="text-[var(--text-primary)]">OpenWrt</strong>. Большинство роутеров Ростелеком (Sercomm, ZTE, Sagemcom) имеют ограниченную прошивку.
              </p>
              <WarningBlock>
                Если роутер Ростелеком <strong>не поддерживает</strong> OpenWrt — переходите к <strong>Варианту Б</strong> (Шаг 3). Это самый распространённый случай.
              </WarningBlock>
            </StepCard>

            <StepCard num={2} title="Вариант А — OpenWrt" badge="Продвинутый">
              <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Если роутер поддерживает OpenWrt (TP-Link, Keenetic и др.):
              </p>
              <ul className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Перепрошейте роутер на OpenWrt</span></li>
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Установите <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">xray-core</code> через opkg</span></li>
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Настройте TPROXY-режим</span></li>
              </ul>
              <CodeBlock title="Terminal — OpenWrt" code={`opkg update\nopkg install xray-core\nxray version\nvi /etc/xray/config.json`} />
            </StepCard>

            <StepCard num={3} title="Вариант Б — Linux Transparent Proxy" badge="Проще">
              <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Используем ПК с Ubuntu/Debian или <strong className="text-[var(--text-primary)]">Raspberry Pi</strong> как промежуточный VPN-шлюз.
              </p>
              <InfoBlock icon={<Settings size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
                <strong className="text-[var(--text-primary)]">Схема:</strong> Интернет → Роутер Ростелеком → Linux ПК/RPi (Xray) → Wi-Fi точка доступа → Устройства
              </InfoBlock>
              <CodeBlock title="Terminal — установка Xray" code={`bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install\nxray version`} />
              <CodeBlock title="Terminal — IP-форвардинг и TPROXY" code={`echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf\nsudo sysctl -p\n\nsudo iptables -t mangle -A PREROUTING -p tcp -j TPROXY \\\\\n  --on-port 12345 --tproxy-mark 1\nsudo iptables -t mangle -A PREROUTING -p udp -j TPROXY \\\\\n  --on-port 12345 --tproxy-mark 1\n\nsudo ip rule add fwmark 1 table 100\nsudo ip route add local 0.0.0.0/0 dev lo table 100`} />
            </StepCard>

            <StepCard num={4} title="Raspberry Pi как VPN-шлюз" badge="Рекомендуем">
              <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Raspberry Pi 3/4/5 — идеальный домашний VPN-шлюз. Тихий, энергоэффективный, достаточно мощный.
              </p>
              <ul className="text-[13px] sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Установите <strong className="text-[var(--text-primary)]">Raspberry Pi OS Lite</strong></span></li>
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Подключите RPi к роутеру по Ethernet</span></li>
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Установите Xray (см. Шаг 3)</span></li>
                <li className="flex items-start gap-2"><ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" /><span>Настройте Wi-Fi точку доступа через <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">hostapd</code></span></li>
              </ul>
              <CodeBlock title="Terminal — Wi-Fi AP" code={`sudo apt install hostapd dnsmasq -y\nsudo nano /etc/hostapd/hostapd.conf\n\n# interface=wlan0\n# ssid=AtlasSecure-Home\n# wpa=2\n# wpa_passphrase=ваш_пароль\n\nsudo systemctl enable hostapd\nsudo systemctl start hostapd`} />
            </StepCard>

            <StepCard num={5} title="Конфигурация Xray (VLESS + Reality)">
              <WarningBlock>
                Это <strong>примерная конфигурация</strong>. UUID, публичный ключ, SNI, адрес сервера и порты скрыты. Индивидуальную конфигурацию запрашивайте у <strong>личного менеджера</strong> в поддержке Atlas Secure.
              </WarningBlock>
              <CodeBlock title="config.json — примерная конфигурация" code={EXAMPLE_CONFIG} copyable={false} />
            </StepCard>

            <StepCard num={6} title="Запуск и проверка">
              <CodeBlock title="Terminal" code={`sudo systemctl enable xray\nsudo systemctl start xray\nsudo systemctl status xray\n\n# Проверка:\ncurl -x socks5://127.0.0.1:1080 https://ifconfig.me`} />
              <InfoBlock icon={<CheckCircle size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
                <strong className="text-[var(--text-primary)]">Готово!</strong> Все устройства в домашней сети защищены. Трафик шифруется по протоколу VLESS + Reality — устойчивому к DPI-анализу.
              </InfoBlock>
            </StepCard>
          </AccordionSection>
        </div>

        {/* ═══ DOWNLOAD APPS ═══ */}
        <div style={{ marginTop: "clamp(32px, 5vw, 48px)" }}>
          <h2 className="font-display font-bold text-[var(--text-primary)]" style={{ fontSize: "clamp(1rem, 3vw, 1.35rem)", marginBottom: "clamp(14px, 3vw, 20px)" }}>Скачать приложение</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <a href="https://apps.apple.com/app/v2raytun/id6476628951" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl font-medium text-[13px] sm:text-sm transition-all duration-300 hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
              style={{ padding: "clamp(11px, 3vw, 16px)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <Apple size={16} /> iOS
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl font-medium text-[13px] sm:text-sm transition-all duration-300 hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
              style={{ padding: "clamp(11px, 3vw, 16px)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <Smartphone size={16} /> Android
            </a>
            <a href="#" className="flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl font-medium text-[13px] sm:text-sm transition-all duration-300 hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
              style={{ padding: "clamp(11px, 3vw, 16px)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <Monitor size={16} /> Windows
            </a>
            <a href="#" className="flex items-center justify-center gap-2 sm:gap-2.5 rounded-xl font-medium text-[13px] sm:text-sm transition-all duration-300 hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
              style={{ padding: "clamp(11px, 3vw, 16px)", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <Laptop size={16} /> macOS
            </a>
          </div>
        </div>

        {/* ═══ CTA BUTTON ═══ */}
        <div style={{ marginTop: "clamp(24px, 4vw, 32px)" }}>
          <a href="https://t.me/Atlas_SupportSecurity" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full font-semibold transition-all duration-300 text-[var(--bg-deep)] hover:opacity-90"
            style={{ padding: "clamp(14px, 3vw, 16px) 24px", borderRadius: "14px", fontSize: "clamp(14px, 2.5vw, 15px)", background: "var(--accent)" }}>
            <Send size={16} /> Написать в поддержку
          </a>
        </div>

        {/* ═══ SUPPORT CARD ═══ */}
        <div className="rounded-xl sm:rounded-2xl text-center" style={{ marginTop: "clamp(24px, 4vw, 32px)", padding: "clamp(20px, 5vw, 36px)", background: "linear-gradient(135deg, var(--bg-card) 0%, #0f1a0f 100%)", border: "1px solid var(--border-accent)" }}>
          <Shield size={24} className="mx-auto mb-3 text-[var(--accent)]" />
          <h3 className="font-display font-bold text-[var(--text-primary)]" style={{ fontSize: "clamp(1rem, 2.5vw, 1.125rem)", marginBottom: "8px" }}>Нужна помощь?</h3>
          <p className="text-[13px] sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Обратитесь к личному менеджеру Atlas Secure — поможем настроить VPN на любом устройстве и выдадим персональную конфигурацию.
          </p>
        </div>
      </main>
    </div>
  );
}
