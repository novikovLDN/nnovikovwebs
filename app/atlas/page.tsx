"use client";

import { useState } from "react";
import { ArrowLeft, Monitor, Smartphone, Apple, Tv, Wifi, Shield, Copy, Check, AlertTriangle, Terminal, ChevronRight, Globe, Laptop } from "lucide-react";

/* ═══════════════════════════════════════════════════
   DEVICE TABS
   ═══════════════════════════════════════════════════ */

const DEVICES = [
  { id: "router", label: "Роутер", icon: Wifi, available: true },
  { id: "windows", label: "Windows", icon: Monitor, available: false },
  { id: "macos", label: "macOS", icon: Laptop, available: false },
  { id: "ios", label: "iOS", icon: Smartphone, available: false },
  { id: "android", label: "Android", icon: Smartphone, available: false },
  { id: "tv", label: "Smart TV", icon: Tv, available: false },
] as const;

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
   COPY BUTTON
   ═══════════════════════════════════════════════════ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium px-3 py-1.5 rounded-lg transition-all duration-300"
      style={{
        background: copied ? "rgba(0, 255, 106, 0.15)" : "rgba(255,255,255,0.06)",
        color: copied ? "var(--accent)" : "var(--text-muted)",
        border: `1px solid ${copied ? "var(--border-accent)" : "var(--border)"}`,
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Скопировано" : "Копировать"}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   WARNING BLOCK
   ═══════════════════════════════════════════════════ */

function WarningBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 rounded-xl"
      style={{
        padding: "clamp(14px, 3vw, 18px)",
        background: "rgba(255, 180, 0, 0.06)",
        border: "1px solid rgba(255, 180, 0, 0.2)",
      }}
    >
      <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: "#ffb400" }} />
      <div className="text-sm leading-relaxed" style={{ color: "rgba(255, 180, 0, 0.9)" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   INFO BLOCK
   ═══════════════════════════════════════════════════ */

function InfoBlock({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 rounded-xl"
      style={{
        padding: "clamp(14px, 3vw, 18px)",
        background: "rgba(0, 255, 106, 0.04)",
        border: "1px solid rgba(0, 255, 106, 0.15)",
      }}
    >
      {icon || <Globe size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}
      <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CODE BLOCK
   ═══════════════════════════════════════════════════ */

function CodeBlock({ title, code, copyable = true }: { title?: string; code: string; copyable?: boolean }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-[var(--accent)]" />
            <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-muted)]">{title}</span>
          </div>
          {copyable && <CopyButton text={code} />}
        </div>
      )}
      <pre className="overflow-x-auto" style={{ padding: "clamp(14px, 3vw, 20px)", margin: 0 }}>
        <code className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STEP COMPONENT
   ═══════════════════════════════════════════════════ */

function Step({ num, title, badge, children }: { num: number; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl"
      style={{
        padding: "clamp(20px, 4vw, 32px)",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #00ccff 100%)",
            color: "var(--bg-deep)",
          }}
        >
          {num}
        </div>
        <div className="flex items-center gap-3 flex-wrap min-w-0 pt-1.5">
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          {badge && (
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider"
              style={{ background: "rgba(0, 255, 106, 0.12)", color: "var(--accent)", border: "1px solid rgba(0, 255, 106, 0.2)" }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-4" style={{ paddingLeft: "0" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROUTER GUIDE
   ═══════════════════════════════════════════════════ */

function RouterGuide() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl" style={{ padding: "clamp(20px, 4vw, 28px)", background: "var(--bg-card)", border: "1px solid var(--border-accent)" }}>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={22} className="text-[var(--accent)]" />
          <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">Atlas Secure VPN на роутере Ростелеком</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Полная инструкция по настройке VPN-подключения через Xray/VLESS + Reality на роутере провайдера Ростелеком. После настройки все устройства в сети будут автоматически защищены.
        </p>
      </div>

      {/* Step 1 */}
      <Step num={1} title="Определите модель роутера">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Проверьте, поддерживает ли ваш роутер прошивку <strong className="text-[var(--text-primary)]">OpenWrt</strong>. Большинство роутеров Ростелеком (Sercomm, ZTE, Sagemcom) имеют ограниченную прошивку.
        </p>
        <WarningBlock>
          Если роутер Ростелеком <strong>не поддерживает</strong> OpenWrt — переходите сразу к <strong>Варианту Б</strong> (Шаг 3). Это самый распространённый случай.
        </WarningBlock>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Для проверки совместимости: откройте <strong className="text-[var(--text-primary)]">openwrt.org/toh</strong> и найдите свою модель. Если есть — используйте Вариант А.
        </p>
      </Step>

      {/* Step 2 — Variant A */}
      <Step num={2} title="Вариант А — OpenWrt на роутере" badge="Продвинутый">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Если ваш роутер поддерживает OpenWrt (например, TP-Link или Keenetic):
        </p>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Перепрошейте роутер на OpenWrt через веб-интерфейс</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Установите пакет <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">xray-core</code> через opkg</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Настройте TPROXY-режим для перенаправления трафика</span>
          </li>
        </ul>

        <CodeBlock
          title="Terminal — установка Xray на OpenWrt"
          code={`# Обновляем пакеты
opkg update

# Устанавливаем xray-core
opkg install xray-core

# Проверяем установку
xray version

# Создаём конфиг
vi /etc/xray/config.json`}
        />

        <WarningBlock>
          Для TPROXY-режима нужно изменить конфиг Xray — добавить <code className="bg-[rgba(255,180,0,0.15)] px-1.5 py-0.5 rounded text-[12px]">dokodemo-door</code> inbound на порт 12345. Полный конфиг для роутера — в Шаге 5.
        </WarningBlock>
      </Step>

      {/* Step 3 — Variant B */}
      <Step num={3} title="Вариант Б — Transparent Proxy через Linux-устройство" badge="Проще">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Если роутер не поддерживает OpenWrt — используем ПК с Ubuntu/Debian или Raspberry Pi как промежуточный узел.
        </p>

        <InfoBlock>
          <strong className="text-[var(--text-primary)]">Схема:</strong> Интернет → Роутер Ростелеком → Linux ПК/RPi (Xray) → Wi-Fi точка доступа / коммутатор → Устройства
        </InfoBlock>

        <h4 className="text-base font-semibold text-[var(--text-primary)] mt-2">3.1 Установка Xray на Linux (Ubuntu/Debian)</h4>

        <CodeBlock
          title="Terminal"
          code={`# Официальный установщик от XTLS
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# Проверяем
xray version

# Конфиг по умолчанию:
# /usr/local/etc/xray/config.json`}
        />

        <h4 className="text-base font-semibold text-[var(--text-primary)] mt-2">3.2 Настройка IP-форвардинга</h4>

        <CodeBlock
          title="Terminal"
          code={`# Включаем форвардинг
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Настройка iptables для TPROXY
sudo iptables -t mangle -A PREROUTING -p tcp -j TPROXY \\
  --on-port 12345 --tproxy-mark 1

sudo iptables -t mangle -A PREROUTING -p udp -j TPROXY \\
  --on-port 12345 --tproxy-mark 1

# Маршрутизация через метки
sudo ip rule add fwmark 1 table 100
sudo ip route add local 0.0.0.0/0 dev lo table 100`}
        />
      </Step>

      {/* Step 4 — Raspberry Pi */}
      <Step num={4} title="Raspberry Pi как VPN-шлюз" badge="Рекомендуем">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Raspberry Pi 3/4/5 — идеальный вариант для домашнего VPN-шлюза. Работает тихо, потребляет мало энергии, достаточно мощный для шифрования.
        </p>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Установите <strong className="text-[var(--text-primary)]">Raspberry Pi OS Lite</strong> (без графики)</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Подключите RPi к роутеру по Ethernet</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Установите Xray (см. Шаг 3.1)</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Настройте RPi как DHCP-шлюз или Wi-Fi точку доступа через <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">hostapd</code></span>
          </li>
        </ul>

        <CodeBlock
          title="Terminal — Wi-Fi точка доступа"
          code={`# Установка hostapd и dnsmasq
sudo apt install hostapd dnsmasq -y

# Настраиваем интерфейс wlan0
sudo nano /etc/hostapd/hostapd.conf

# Пример конфига hostapd:
# interface=wlan0
# ssid=AtlasSecure-Home
# hw_mode=g
# channel=7
# wpa=2
# wpa_passphrase=ваш_пароль
# wpa_key_mgmt=WPA-PSK

# Запускаем
sudo systemctl enable hostapd
sudo systemctl start hostapd`}
        />
      </Step>

      {/* Step 5 — Config */}
      <Step num={5} title="Конфигурация Xray (VLESS + Reality)">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Поместите конфигурацию в файл <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">/usr/local/etc/xray/config.json</code> (Linux) или <code className="text-[var(--accent)] bg-[rgba(0,255,106,0.08)] px-1.5 py-0.5 rounded text-[12px]">/etc/xray/config.json</code> (OpenWrt):
        </p>

        <WarningBlock>
          Это <strong>примерная конфигурация</strong>. Все чувствительные данные (UUID, публичный ключ, SNI, адрес сервера, порты) скрыты. Вашу индивидуальную конфигурацию запрашивайте у <strong>личного менеджера</strong> в поддержке проекта Atlas Secure.
        </WarningBlock>

        <CodeBlock
          title="config.json — примерная конфигурация"
          code={EXAMPLE_CONFIG}
          copyable={false}
        />

        <InfoBlock>
          <strong className="text-[var(--text-primary)]">Как получить конфиг:</strong> Напишите в поддержку Atlas Secure — вам выдадут персональную конфигурацию с уникальными ключами и параметрами подключения.
        </InfoBlock>
      </Step>

      {/* Step 6 — Launch */}
      <Step num={6} title="Запуск и проверка">
        <CodeBlock
          title="Terminal"
          code={`# Запускаем Xray
sudo systemctl enable xray
sudo systemctl start xray

# Проверяем статус
sudo systemctl status xray

# Проверяем подключение
curl -x socks5://127.0.0.1:1080 https://ifconfig.me

# Если всё работает — увидите IP VPN-сервера`}
        />

        <h4 className="text-base font-semibold text-[var(--text-primary)] mt-2">Проверка на устройствах</h4>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Подключите устройство к Wi-Fi точке доступа RPi (или к сети через роутер с OpenWrt)</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Откройте <strong className="text-[var(--text-primary)]">ifconfig.me</strong> в браузере</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight size={14} className="text-[var(--accent)] shrink-0 mt-1" />
            <span>Должен отображаться IP VPN-сервера, а не ваш домашний IP</span>
          </li>
        </ul>

        <InfoBlock icon={<Shield size={20} className="shrink-0 mt-0.5 text-[var(--accent)]" />}>
          <strong className="text-[var(--text-primary)]">Готово!</strong> Все устройства в вашей домашней сети теперь защищены через Atlas Secure VPN. Трафик шифруется по протоколу VLESS + Reality — это один из самых защищённых протоколов, устойчивый к DPI-анализу.
        </InfoBlock>
      </Step>

      {/* Support */}
      <div
        className="rounded-2xl text-center"
        style={{
          padding: "clamp(28px, 5vw, 40px)",
          background: "linear-gradient(135deg, var(--bg-card) 0%, #0f1a0f 100%)",
          border: "1px solid var(--border-accent)",
        }}
      >
        <Shield size={32} className="mx-auto mb-4 text-[var(--accent)]" />
        <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Нужна помощь с настройкой?</h3>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6 leading-relaxed">
          Обратитесь к вашему личному менеджеру Atlas Secure — поможем настроить VPN на любом устройстве и выдадим персональную конфигурацию.
        </p>
        <a
          href="https://t.me/your_telegram"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary sm:!w-auto"
          style={{ display: "inline-flex" }}
        >
          Написать в поддержку
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMING SOON PLACEHOLDER
   ═══════════════════════════════════════════════════ */

function ComingSoon({ device }: { device: string }) {
  return (
    <div
      className="rounded-2xl text-center"
      style={{
        padding: "clamp(40px, 8vw, 80px) clamp(20px, 4vw, 40px)",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <Shield size={48} className="mx-auto mb-5 text-[var(--text-muted)]" />
      <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
        Инструкция для {device}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
        Инструкция готовится и скоро будет доступна. Обратитесь в поддержку Atlas Secure для получения помощи с настройкой.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function AtlasPage() {
  const [activeDevice, setActiveDevice] = useState("router");

  const deviceLabels: Record<string, string> = {
    windows: "Windows",
    macos: "macOS",
    ios: "iOS",
    android: "Android",
    tv: "Smart TV",
  };

  return (
    <div style={{ background: "var(--bg-deep)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: "rgba(8, 8, 8, 0.6)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="max-w-[900px] mx-auto flex items-center justify-between"
          style={{ padding: "14px clamp(16px, 4vw, 32px)" }}
        >
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">На главную</span>
          </a>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[var(--accent)]" />
            <span className="font-display font-bold text-[var(--text-primary)] text-sm">Atlas Secure</span>
          </div>
          <div style={{ width: "72px" }} />
        </div>
      </header>

      {/* Content */}
      <main
        className="max-w-[900px] mx-auto"
        style={{ padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px) clamp(48px, 8vw, 80px)" }}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-2 h-2 rounded-full bg-[var(--accent)]"
              style={{ boxShadow: "0 0 12px rgba(0, 255, 106, 0.35)" }}
            />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--accent)]">
              Инструкции
            </span>
          </div>
          <h1
            className="font-display font-bold tracking-tight text-[var(--text-primary)]"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", lineHeight: 1.1 }}
          >
            Настройка <span className="gradient-text">Atlas Secure</span>
          </h1>
          <p
            className="text-[var(--text-secondary)] mt-4 max-w-lg mx-auto"
            style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
          >
            Выберите устройство и следуйте пошаговой инструкции для подключения VPN
          </p>
        </div>

        {/* Device Selector */}
        <div
          className="flex flex-wrap justify-center mb-10"
          style={{ gap: "clamp(6px, 1.5vw, 10px)" }}
        >
          {DEVICES.map((d) => {
            const Icon = d.icon;
            const isActive = activeDevice === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDevice(d.id)}
                className="flex items-center gap-2 rounded-xl font-medium transition-all duration-300"
                style={{
                  padding: "clamp(8px, 2vw, 12px) clamp(12px, 2.5vw, 20px)",
                  fontSize: "clamp(12px, 1.5vw, 14px)",
                  background: isActive ? "rgba(0, 255, 106, 0.1)" : "var(--bg-card)",
                  border: `1px solid ${isActive ? "var(--border-accent)" : "var(--border)"}`,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  opacity: d.available ? 1 : 0.5,
                }}
              >
                <Icon size={16} />
                <span className="hidden min-[400px]:inline">{d.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guide Content */}
        {activeDevice === "router" ? (
          <RouterGuide />
        ) : (
          <ComingSoon device={deviceLabels[activeDevice] || activeDevice} />
        )}
      </main>
    </div>
  );
}
