import React, { useEffect, useMemo, useState } from "react";

// ===== Mock helpers (no backend) =====
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const formatPhone = (v = "") =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d)(\d{3})(\d{3})(\d{2})(\d{2})/, "+$1 ($2) $3-$4-$5");

const isValidPhone = (raw) => /^(7|1|3|9)\d{10}$/.test(raw.replace(/\D/g, ""));

const DEFAULT_OTP = "123456"; // demo code

export default function LoyaltyRegistrationPage() {
  const [step, setStep] = useState(1); // 1: form, 2: otp, 3: card
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);
  useEffect(() => setMounted(true), []);

  // Toasts
  const [toast, setToast] = useState(null); // { type: 'success' | 'info' | 'error', text: string }
  const showToast = (text, type = "info", ttl = 2200) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), ttl);
  };

  // helper to scroll to issued card
  const scrollToCard = () => {
    const el = document.getElementById("issued-card");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const setVars = (darkMode) => {
      const s = document.documentElement.style;
      if (darkMode) {
        s.setProperty("--brand-primary", "#6C8BFF");
        s.setProperty("--brand-text", "#E5E7EB");
        s.setProperty("--bg-soft", "#0B1029");
        s.setProperty("--muted", "#9AA4B2");
      } else {
        s.setProperty("--brand-primary", "#1F49E5");
        s.setProperty("--brand-text", "#0E1446");
        s.setProperty("--bg-soft", "#F6F8FF");
        s.setProperty("--muted", "#8A8FA3");
      }
    };
    setVars(dark);
  }, []);

  // Form state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canSend = useMemo(() => isValidPhone(phone) && terms, [phone, terms]);

  useEffect(() => {
    setError("");
  }, [step]);

  useEffect(() => {
    const h = document.getElementById("hero");
    if (h) {
      requestAnimationFrame(() => {
        h.classList.remove("opacity-0", "translate-y-2");
        h.classList.add("opacity-100", "translate-y-0");
      });
    }
  }, []);

  const handleSendCode = async () => {
    if (!canSend) return;
    setLoading(true);
    setError("");
    await sleep(700); // simulate network

    // Demo branch: if phone already "registered" (ends with 00), skip to card
    const digits = phone.replace(/\D/g, "");
    const already = /00$/.test(digits);
    setLoading(false);
    if (already) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleConfirmCode = async () => {
    setLoading(true);
    setError("");
    await sleep(600);
    setLoading(false);

    if (otpValue === DEFAULT_OTP) {
      setStep(3);
      showToast("Карта успешно оформлена 🎉", "success");
      navigator.vibrate?.(20);
      setTimeout(scrollToCard, 50);
    } else {
      setError("Неверный код. Введите 123456 для демо.");
    }
  };

  useEffect(() => {
    if (step !== 3) return;
    const a = document.getElementById("success-actions");
    if (a) {
      requestAnimationFrame(() => {
        a.classList.remove("opacity-0", "translate-y-1");
        a.classList.add("opacity-100", "translate-y-0");
      });
    }
  }, [step]);

  const handleResend = async () => {
    setLoading(true);
    await sleep(500);
    setLoading(false);
  };

  const resetAll = () => {
    setStep(1);
    setPhone("");
    setName("");
    setBirth("");
    setEmail("");
    setTerms(false);
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  // Dynamic background for wrapper
  const wrapperBg = step === 1
    ? "bg-gradient-to-br from-[#F9FAFB] to-[#E9ECF2] dark:from-[#0B0E16] dark:to-[#1C1F28]"
    : step === 2
    ? "bg-gradient-to-br from-[#F3F4FF] to-[#ECE8FF] dark:from-[#0C0B1A] dark:to-[#1A1930]"
    : "bg-gradient-to-br from-[#FFF7F0] to-[#FFEFE3] dark:from-[#1A130B] dark:to-[#2A1F13]";

  return (
    <div className={`min-h-screen ${wrapperBg}`}>
      <Header />
      <main className="mx-auto max-w-5xl px-3 md:px-4 py-6 md:py-10">
        <Hero
          onClickCTA={() => {
            const form = document.getElementById("reg-form");
            form?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <div
          id="reg-form"
          className="mt-6 md:mt-10 grid grid-cols-1 gap-6 md:grid-cols-5 px-2 md:px-0"
        >
          <div className="md:col-span-3">
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 p-6 shadow-[0_1px_20px_rgba(0,0,0,0.05)]">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[--brand-primary]/10 text-[--brand-primary]">
                  {step}
                </span>
                <h2 className="text-xl font-semibold text-[--brand-text]">
                  {step === 1 && "Регистрация"}
                  {step === 2 && "Подтверждение номера"}
                  {step === 3 && "Ваша карта готова"}
                </h2>
                <span className="ml-2 text-sm text-[--muted]">Шаг {step} из 3</span>
              </div>

              {step === 1 && (
                <FormStep
                  values={{ phone, name, birth, email, terms }}
                  onChange={{ setPhone, setName, setBirth, setEmail, setTerms }}
                  onSubmit={handleSendCode}
                  canSend={canSend}
                  loading={loading}
                />
              )}

              {step === 2 && (
                <OtpStep
                  otp={otp}
                  setOtp={setOtp}
                  onConfirm={handleConfirmCode}
                  onResend={handleResend}
                  loading={loading}
                  error={error}
                  phonePretty={formatPhone(phone)}
                />
              )}

              {step === 3 && (
                <SuccessStep
                  name={name}
                  phone={phone}
                  birth={birth}
                  email={email}
                  onReset={resetAll}
                />
              )}

              {error && step !== 3 && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <Benefits />
          </div>
        </div>
      </main>
      {toast && <Toast type={toast.type} text={toast.text} />}
      {step === 1 && (
        <MobileFixedCTA
          label={loading ? 'Отправка…' : 'Продолжить'}
          onClick={() => {
            if (!loading) {
              const ok = isValidPhone(phone) && terms;
              if (ok) handleSendCode();
              else document.getElementById('reg-form')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}
      {step === 2 && (
        <MobileFixedCTA
          label={loading ? 'Проверяем…' : 'Подтвердить'}
          onClick={() => { if (!loading) handleConfirmCode(); }}
        />
      )}
      {step === 3 && (
        <MobileFixedCTA
          label={isIOS ? 'Добавить в Apple Wallet' : 'Добавить в Google Wallet'}
        />
      )}
      <Footer />
    </div>
  );
}

// ===== UI Blocks =====
function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-[--chip-bronze] to-[--brand-primary]" />
          <span className="font-semibold text-[--brand-text]">
            Bridge Loyalty
          </span>
        </div>
        <a
          href="#reg-form"
          className="rounded-full bg-[--brand-primary] px-6 py-3 text-white font-medium shadow-md transition hover:opacity-95 active:scale-[0.97]"
        >
          Получить карту
        </a>
      </div>
    </header>
  );
}

function Hero({ onClickCTA }) {
  return (
    <section
      className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-5 md:p-8 shadow-[0_1px_20px_rgba(0,0,0,0.05)] transition-all duration-500 opacity-0 translate-y-2 will-change-transform"
      id="hero"
    >
      <div className="grid grid-cols-1 items-center gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-[--brand-text]">
            Присоединяйтесь к программе лояльности и получайте бонусы за каждую
            покупку
          </h1>
          <p className="mt-3 text-[--muted]">
            Кэшбэк бонусами, подарки на день рождения и персональные предложения
            — ваша электронная карта всегда под рукой.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClickCTA}
              className="w-full sm:w-auto rounded-full bg-[--brand-primary] px-6 py-3 text-white font-medium shadow-md transition hover:opacity-95 active:scale-[0.97]"
            >
              Получить карту
            </button>
            <a
              href="#benefits"
              className="w-full sm:w-auto rounded-full border border-black/10 bg-white/60 backdrop-blur px-6 py-3 text-[--brand-text] shadow-sm transition hover:shadow-md"
            >
              Преимущества
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormRow({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[--brand-text]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-[--muted]">{hint}</span>
      )}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", name, inputMode }) {
  const resolvedInputMode = inputMode || (name === "phone" ? "tel" : undefined);
  return (
    <input
      name={name}
      type={type}
      inputMode={resolvedInputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-black/10 bg-white/60 backdrop-blur px-4 py-3 outline-none ring-0 shadow-inner transition focus:border-[--brand-primary] focus:shadow focus:bg-white/80 text-base"
    />
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 rounded border"
      />
      <span className="text-sm text-[--brand-text]">{children}</span>
    </label>
  );
}

function FormStep({ values, onChange, onSubmit, canSend, loading }) {
  const { phone, name, birth, email, terms } = values;
  const { setPhone, setName, setBirth, setEmail, setTerms } = onChange;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="grid grid-cols-1 gap-4"
    >
      <FormRow label="Телефон" hint="В демо допустим формат: +7 (900) 123-45-67">
        <Input
          name="phone"
          inputMode="tel"
          value={phone}
          onChange={(v) => setPhone(formatPhone(v))}
          placeholder="+7 (___) ___-__-__"
        />
      </FormRow>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormRow label="Имя (необязательно)">
          <Input value={name} onChange={setName} placeholder="Иван" />
        </FormRow>
        <FormRow label="Дата рождения (необязательно)" hint="Для подарка на ДР">
          <Input type="date" value={birth} onChange={setBirth} />
        </FormRow>
      </div>

      <FormRow label="Email (необязательно)">
        <Input type="email" value={email} onChange={setEmail} placeholder="mail@example.com" />
      </FormRow>

      <Checkbox checked={terms} onChange={setTerms}>
        Согласен с <a href="#" className="underline">условиями программы</a> и <a href="#" className="underline">политикой конфиденциальности</a>
      </Checkbox>

      <button
        type="submit"
        disabled={!canSend || loading}
        className="w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[--brand-primary] px-6 py-3 text-white font-medium shadow-md transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Отправка..." : "Отправить код"}
      </button>

      <p className="text-xs text-[--muted]">
        Демо: если номер заканчивается на 00 — считаем, что пользователь уже
        зарегистрирован и сразу выдаём карту.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-[--muted]">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[--brand-primary]/10">
          🔒
        </span>
        <span>Ваши данные защищены. Никакого спама — только бонусы и подарки.</span>
      </div>
    </form>
  );
}

function OtpInput({ values, setValues, disabled, onComplete }) {
  useEffect(() => {
    const first = document.querySelector('#otp-0');
    first?.focus();
  }, []);
  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          className="h-14 w-12 md:h-12 md:w-10 rounded-2xl border border-black/10 bg-white/70 backdrop-blur text-center text-lg shadow-inner"
          value={v}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 1);
            const next = [...values];
            next[i] = val;
            setValues(next);
            const nextEl = document.querySelector(`#otp-${i + 1}`);
            if (val && nextEl) nextEl.focus();
            if (val && i === values.length - 1) {
              setTimeout(() => onComplete?.(), 0);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !values[i] && i > 0) {
              const prevEl = document.querySelector(`#otp-${i - 1}`);
              prevEl?.focus();
            }
          }}
          id={`otp-${i}`}
        />
      ))}
    </div>
  );
}

function OtpStep({ otp, setOtp, onConfirm, onResend, loading, error, phonePretty }) {
  return (
    <div>
      <p className="mb-4 text-[--brand-text]">
        Мы отправили код на номер <span className="font-semibold">{phonePretty}</span>
      </p>

      <OtpInput
        values={otp}
        setValues={setOtp}
        disabled={loading}
        onComplete={() => { if (!loading) onConfirm(); }}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full sm:w-auto rounded-full bg-[--brand-primary] px-6 py-3 text-white font-medium shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? "Проверяем..." : "Подтвердить"}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="w-full sm:w-auto rounded-full border border-black/10 bg-white/60 backdrop-blur px-6 py-3 shadow-sm active:scale-[0.98]"
        >
          Отправить код снова
        </button>
      </div>

      <p className="mt-3 text-xs text-[--muted]">
        Демо-код: <code className="rounded bg-gray-100 px-1">123456</code>
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SuccessStep({ name, phone, birth, email }) {
  const masked = useMemo(
    () => `${phone.slice(0, 4)}•••${phone.slice(-4)}`,
    [phone]
  );
  const [lvl, setLvl] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setLvl(8), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="issued-card" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Left: the card preview returns after OTP */}
      <div className="flex items-center justify-center">
        <CardPreview
          name={name || "Участник"}
          number={`**** ${phone.replace(/\D/g, "").slice(-4) || "0000"}`}
          status="active"
        />
      </div>

      {/* Right: actions + welcome + details (glass) */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-4 md:p-5 text-sm">
        <div className="mb-3">
          <div className="text-base font-semibold">
            Добро пожаловать{name ? `, ${name}` : ""}! 🎉
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-[--muted] mb-1">
              <span>Bronze → Silver</span>
              <span>0/300</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
              <div className="h-full rounded-full bg-[--brand-primary] transition-all" style={{ width: `${lvl}%` }}></div>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-4 gap-3 mb-4 justify-items-center transition-all duration-500 opacity-0 translate-y-1"
          id="success-actions"
        >
          <AppIconButton
            kind="apple"
            label="Apple Wallet"
            onClick={() => {
              /* TODO: pkpass */
            }}
          />
          <AppIconButton
            kind="google"
            label="Google Wallet"
            onClick={() => {
              /* TODO: gpay jwt */
            }}
          />
          <AppIconButton
            kind="telegram"
            label="Telegram"
            onClick={() => {
              /* TODO: open bot/link */
            }}
          />
          <AppIconButton
            kind="pdf"
            label="PDF"
            onClick={() => {
              /* TODO: generate PDF */
            }}
          />
        </div>
        <div className="mb-3">
          <button
            onClick={() => {
              const shareData = { title: 'Моя карта Bridge Loyalty', text: 'Моя электронная карта лояльности', url: window.location.href };
              if (navigator.share) {
                navigator.share(shareData).catch(() => {});
              } else {
                navigator.clipboard?.writeText(shareData.url);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 backdrop-blur px-4 py-2 text-sm shadow-sm active:scale-[0.98]"
          >
            Поделиться картой
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-[--muted]">Имя</span>
          <span className="text-[--brand-text]">{name || "—"}</span>
          <span className="text-[--muted]">Телефон</span>
          <span className="text-[--brand-text]">{masked}</span>
          <span className="text-[--muted]">ДР</span>
          <span className="text-[--brand-text]">{birth || "—"}</span>
          <span className="text-[--muted]">Email</span>
          <span className="text-[--brand-text]">{email || "—"}</span>
        </div>

        <p className="mt-4 text-xs text-[--muted]">
          Сохраните карту в удобный кошелёк, чтобы держать бонусы под рукой.
        </p>
      </div>
    </div>
  );
}

function MobileFixedCTA({ label, onClick }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-2">
        <button
          onClick={onClick}
          className="w-full h-12 rounded-full bg-[--brand-primary] text-white font-medium shadow-md transition active:scale-[0.98]"
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function WalletButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl border px-4 py-3 text-[--brand-text] transition hover:bg-gray-50 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

function AppIconButton({ kind, label, onClick }) {
  const base =
    "h-12 w-12 rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm flex items-center justify-center transition transform hover:-translate-y-0.5 active:scale-[0.96] hover:shadow md:h-14 md:w-14";
  return (
    <button onClick={onClick} aria-label={label} title={label} className={base}>
      {kind === "apple" && (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="text-black">
          <path d="M16.365 1.43c0 1.14-.42 2.1-1.26 2.89-.9.84-1.89 1.32-3 .12-.12-1.14.42-2.16 1.26-2.94.84-.78 1.98-1.26 2.94-1.2.06.36.06.72.06 1.13z"/>
          <path d="M21.6 17.46c-.42.96-.96 1.86-1.56 2.64-.9 1.14-1.86 2.28-3.24 2.28-1.38 0-1.86-.72-3.48-.72-1.68 0-2.16.72-3.54.78-1.38.06-2.34-1.2-3.24-2.34-1.74-2.28-3.06-6.48-1.26-9.36.9-1.44 2.52-2.34 4.26-2.4 1.32-.06 2.58.78 3.48.78.84 0 2.4-.96 4.08-.84.66.06 2.58.24 3.78 2.04-.12.06-2.22 1.32-2.1 3.9.12 2.58 2.46 3.42 2.52 3.42z"/>
        </svg>
      )}
      {kind === "google" && (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            fill="#EA4335"
            d="M12 10.2v3.84h5.4c-.24 1.26-1.62 3.72-5.4 3.72a6.24 6.24 0 1 1 0-12.48 5.64 5.64 0 0 1 3.96 1.56l2.7-2.7A9.72 9.72 0 0 0 12 2.28a9.72 9.72 0 1 0 0 19.44c5.58 0 9.48-3.9 9.48-9.42 0-.66-.06-1.14-.12-1.62H12z"
          />
        </svg>
      )}
      {kind === "telegram" && (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#229ED9">
          <path d="M9.036 15.803l-.375 5.287c.537 0 .768-.231 1.05-.506l2.523-2.415 5.232 3.83c.96.529 1.649.253 1.911-.889l3.462-16.207.001-.001c.307-1.43-.517-1.987-1.447-1.641L1.27 9.37c-1.404.546-1.382 1.33-.241 1.683l5.396 1.684L19.59 6.018c.565-.344 1.08-.154.656.191"/>
        </svg>
      )}
      {kind === "pdf" && (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#D32F2F">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/>
          <path fill="#fff" d="M8 13h2.5a1.5 1.5 0 0 1 0 3H9v2H8v-5zm3.5 0H14a2 2 0 0 1 0 4h-1.5v1H11v-5zm1.5 3a1 1 0 0 0 0-2H12v2h1zM15 13h3v1h-2v1h2v1h-2v2h-1v-5z"/>
        </svg>
      )}
    </button>
  );
}

function CardPreview({ name = "Участник", number = "**** 2746", status = "new" }) {
  return (
    <div className="relative aspect-[1.6/1] sm:aspect-[1.65/1] md:aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-[--brand-primary] via-[#7C4DFF] to-[--chip-bronze] p-4 md:p-5 pb-6 md:pb-7 text-white shadow-2xl flex flex-col">
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 shadow-[inset_0_1px_18px_rgba(255,255,255,0.2)]" />

      {/* Top header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-8 w-8 rounded-lg bg-white/90 shrink-0" />
          <span className="text-sm font-semibold truncate">Bridge Loyalty</span>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] md:text-xs uppercase tracking-wide shrink-0">
          {status === "new" ? "demo" : "active"}
        </span>
      </div>

      {/* Middle: holder & number */}
      <div className="mt-4 md:mt-5 min-h-0 flex-1">
        <div>
          <div className="text-[10px] md:text-xs opacity-80">Card Holder</div>
          <div className="text-base md:text-xl font-semibold leading-tight truncate">{name}</div>
        </div>

        <div className="mt-3 md:mt-4">
          <div className="text-[10px] md:text-xs opacity-80">Card Number</div>
          <div className="text-sm md:text-lg tracking-wider leading-tight whitespace-nowrap truncate">{number}</div>
        </div>
      </div>

      {/* Bottom: fixed info pinned to bottom */}
      <div className="mt-3 md:mt-4 flex items-center justify-between text-[10px] md:text-xs opacity-80">
        <div>
          <div>Member Since</div>
          <div>{new Date().getFullYear()}</div>
        </div>
        <div className="text-right">
          <div>Tier</div>
          <div className="font-semibold">Bronze</div>
        </div>
      </div>
    </div>
  );
}

function Benefits() {
  const items = [
    { title: "До 10% бонусами", text: "Получайте бонусы за каждую покупку и оплачивайте ими до 100% заказа в акциях." },
    { title: "Подарки на ДР", text: "Специальные предложения и сюрпризы в неделю вашего дня рождения." },
    { title: "Персональные акции", text: "Подбор предложений по вашим интересам и истории покупок." },
    { title: "Единая карта", text: "Apple Wallet, Google Wallet, Telegram — выбирайте удобный кошелёк." },
  ];

  return (
    <aside id="benefits" className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-white/60">
      <h3 className="mb-4 text-lg font-semibold text-[--brand-text]">Почему это выгодно</h3>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-1 md:overflow-visible">
        {items.map((item, idx) => (
          <div key={idx} className="min-w-[240px] snap-start md:min-w-0 rounded-xl border p-4 bg-white/70 backdrop-blur-sm">
            <div className="font-medium text-[--brand-text]">{item.title}</div>
            <div className="text-sm text-[--muted]">{item.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t">
      <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-[--muted]">
        © {new Date().getFullYear()} Bridge Loyalty. Демо-страница регистрации без интеграции. Код подтверждения: 123456.
      </div>
    </footer>
  );
}

// ===== Toast component =====
function Toast({ type = "info", text }) {
  const palette = {
    info: "text-[--brand-text] border-white/60",
    success: "text-green-950 border-white/60",
    error: "text-red-950 border-white/60",
  };
  const cls = palette[type] || palette.info;
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm shadow-xl backdrop-blur-md bg-white/70 border ${cls}`}
    >
      {text}
    </div>
  );
}

// ===== CSS Variables (scoped fallback for demo) =====
const style = document.documentElement.style;
style.setProperty("--brand-primary", "#1F49E5");
style.setProperty("--brand-secondary", "#FF731F");
style.setProperty("--brand-text", "#0E1446");
style.setProperty("--bg-soft", "#F6F8FF");
style.setProperty("--muted", "#8A8FA3");
style.setProperty("--chip-bronze", "#B57F50");