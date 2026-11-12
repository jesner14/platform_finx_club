import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Facebook,
  Instagram,
  Languages,
  Menu,
  Moon,
  Music2,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import {
  DISCOVER_NAV,
  LANGUAGE_OPTIONS,
  MAIN_NAV,
  goPublic,
  type PublicLanguage,
  type PublicPage,
} from "./publicNav";

export function PublicShell({
  active,
  children,
}: {
  active: PublicPage;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<PublicLanguage>("fr");
  const { isDark, setMode } = useTheme();
  const currentLanguage = LANGUAGE_OPTIONS.find((option) => option.code === language) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="finx-public min-h-screen bg-[#05070F] text-white">
      <style>{`
        .finx-public { font-family: 'Inter', system-ui, sans-serif; }
        .finx-public h1, .finx-public h2, .finx-public h3 {
          font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: -0.02em;
          line-height: 1.18;
        }
        .finx-public h1 { font-size: clamp(1.75rem, 3.6vw, 2.65rem) !important; font-weight: 700 !important; }
        .finx-public .finx-home-hero h1 {
          font-size: clamp(2.15rem, 5vw, 4.65rem) !important;
          line-height: 1.02 !important;
          letter-spacing: -0.05em !important;
        }
        .finx-public .finx-invest-hero h1 {
          font-size: clamp(2rem, 4vw, 3.65rem) !important;
          line-height: 1.06 !important;
          letter-spacing: -0.045em !important;
        }
        .finx-public .finx-home-hero .finx-hero-actions button {
          height: 2.625rem;
          padding-inline: 1rem;
          font-size: 0.75rem;
        }
        .finx-public h2 { font-size: clamp(1.4rem, 2.6vw, 2rem) !important; font-weight: 700 !important; }
        .finx-public h3 { font-size: 1.1rem !important; font-weight: 600 !important; }
        @keyframes finx-announcement-scroll {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .finx-announcement-track { animation: finx-announcement-scroll 32s linear infinite; }
        .finx-announcement-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .finx-announcement-track { animation: none; width: 100%; justify-content: center; }
          .finx-announcement-copy { display: none; }
        }
      `}</style>

      <div className="bg-[#0B1B59] px-4 py-1 text-white">
        <div
          aria-label="FINX Club - où l’ambition rencontre l’opportunité. Votre prochaine opportunité commence peut-être par une rencontre."
          className="mx-auto max-w-7xl overflow-hidden text-[11px] font-medium  sm:text-[12px]"
        >
          <p className="sr-only">
            FINX Club ... Où l’ambition rencontre l’opportunité. Votre prochaine opportunité commence peut-être par une rencontre.
          </p>
          <div className="finx-announcement-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden="true"
                className={`flex shrink-0 items-center gap-x-5 pr-5 ${copy === 1 ? "finx-announcement-copy" : ""}`}
              >
                <p className="text-slate-100">FINX Club ... Où l’ambition rencontre l’opportunité</p>
                <span className="h-3.5 w-px bg-white/20" />
                <span className="h-3.5 w-px bg-white/20" />
                <p className="text-slate-100">Votre prochaine opportunité commence peut-être par une rencontre</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-40 border-b ${
        isDark
          ? "border-white/[0.08] bg-[#101A2D] text-[#F4F6FA]"
          : "border-[#0B1B59]/[0.08] bg-white text-[#0B1B59]"
      }`}>
        <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-5 px-5 sm:px-8">
          <button type="button" onClick={() => goPublic("home")} className="flex cursor-pointer items-center shrink-0">
            <img
              src={isDark ? "/logo-finx-white.png" : "/logoFinxReview.png"}
              alt="FINX CLUB"
              className="h-10 w-auto object-contain"
            />
          </button>

          <nav className={`hidden justify-self-center xl:flex items-center gap-x-7 text-[13px] font-medium ${
            isDark ? "text-white/90" : "text-[#0B1B59]/70"
          }`}>
            {MAIN_NAV.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => goPublic(item.page)}
                className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap px-1 text-[13px] font-medium transition-colors ${
                  isDark
                    ? `text-white/90 hover:text-white ${active === item.page ? "text-white" : ""}`
                    : `text-[#0B1B59]/70 hover:text-[#0B1B59] ${active === item.page ? "text-[#0B1B59]" : ""}`
                }`}
              >
                {item.label}
              </button>
            ))}
            <details className="group relative">
              <summary
                className={`flex cursor-pointer list-none items-center gap-1 whitespace-nowrap font-medium transition-colors ${
                  isDark
                    ? `text-white/90 hover:text-white ${DISCOVER_NAV.some((item) => item.page === active) ? "text-white" : ""}`
                    : `hover:text-[#0B1B59] ${DISCOVER_NAV.some((item) => item.page === active) ? "text-[#0B1B59]" : ""}`
                }`}
              >
                Découvrir
                <ChevronDown size={14} strokeWidth={1.8} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className={`absolute left-1/2 top-full z-50 mt-4 w-[19rem] -translate-x-1/2 overflow-hidden rounded-[1.15rem] border border-t-2 p-2 shadow-[0_18px_48px_-20px_rgba(11,27,89,0.28)] ${
                isDark ? "border-white/10 bg-[#141E34]" : "border-[#0B1B59]/10 bg-white"
              }`}>
                <div className="px-3 pb-2.5 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#01AAE4]">Explorer FINX Club</p>
                  <p className={`mt-1 text-[13px] font-semibold tracking-[-0.01em] ${isDark ? "text-white" : "text-[#0B1B59]"}`}>Découvrir nos univers</p>
                </div>
                <div className={`h-px ${isDark ? "bg-white/[0.08]" : "bg-[#0B1B59]/[0.08]"}`} />
                <div className="py-1">
                  {DISCOVER_NAV.map((item) => (
                    <button
                      key={item.page}
                      type="button"
                      onClick={(event) => {
                        goPublic(item.page);
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                      className={`group/item flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isDark
                          ? `hover:bg-[#01AAE4]/[0.12] ${active === item.page ? "bg-[#01AAE4]/[0.12]" : ""}`
                          : `hover:bg-[#EAF7FC] ${active === item.page ? "bg-[#EAF7FC]" : ""}`
                      }`}
                    >
                      <span>
                        <span className={`block text-[13px] font-semibold ${isDark ? "text-white" : "text-[#0B1B59]"}`}>{item.label}</span>
                        <span className={`mt-0.5 block text-[11px] font-normal ${isDark ? "text-[#B9C4D8]" : "text-[#64708A]"}`}>{item.description}</span>
                      </span>
                      <ChevronRight
                        size={15}
                        className={`shrink-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-[#01AAE4] ${isDark ? "text-white/35" : "text-[#0B1B59]/35"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </details>
          </nav>

          <div className="flex items-center justify-self-end gap-3">
            <button
              type="button"
              onClick={() => goPublic("login")}
              className={`hidden cursor-pointer items-center justify-center whitespace-nowrap px-1 text-[13px] font-medium transition-colors sm:inline-flex ${
                isDark ? "text-white/70 hover:text-white" : "text-[#0B1B59]/70 hover:text-[#0B1B59]"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => goPublic("devenir-membre")}
              className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full px-3 py-2.5 text-[12px] font-medium transition-colors sm:px-5 sm:text-[13px] ${
                isDark ? "bg-[#01AAE4] text-white hover:bg-[#35BCEB]" : "bg-[#0B1B59] text-white hover:bg-[#13266B]"
              }`}
            >
              Devenir membre
            </button>
            <span className={`hidden h-6 w-px sm:block ${isDark ? "bg-white/15" : "bg-[#0B1B59]/15"}`} aria-hidden="true" />
            <div className="flex shrink-0 items-center gap-1">
              <details className="group/language relative">
                <summary
                  aria-label="Choisir la langue"
                  className={`flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium transition-colors ${
                    isDark ? "text-white/95 hover:bg-white/[0.1] hover:text-white" : "text-[#0B1B59]/75 hover:bg-[#0B1B59]/[0.06] hover:text-[#0B1B59]"
                  }`}
                >
                  <Languages size={16} strokeWidth={1.8} />
                  <span>{currentLanguage.code.toUpperCase()}</span>
                  <ChevronDown size={13} className="transition-transform group-open/language:rotate-180" />
                </summary>
                <div className={`absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border p-1.5 shadow-[0_16px_40px_-16px_rgba(11,27,89,0.28)] ${
                  isDark ? "border-white/10 bg-[#141E34]" : "border-[#0B1B59]/10 bg-white"
                }`}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={(event) => {
                        setLanguage(option.code);
                        event.currentTarget.closest("details")?.removeAttribute("open");
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                        isDark ? "text-white/75 hover:bg-white/[0.07] hover:text-white" : "text-[#0B1B59]/75 hover:bg-[#F3F7FC] hover:text-[#0B1B59]"
                      }`}
                    >
                      {option.label}
                      {language === option.code && <Check size={14} className="text-[#01AAE4]" />}
                    </button>
                  ))}
                </div>
              </details>
              <span className={`mx-1 hidden h-5 w-px sm:block ${isDark ? "bg-white/15" : "bg-[#0B1B59]/15"}`} aria-hidden="true" />
              <button
                type="button"
                onClick={() => setMode(isDark ? "light" : "dark")}
                aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
                title={isDark ? "Thème clair" : "Thème sombre"}
                className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  isDark ? "text-white/95 hover:bg-white/[0.1] hover:text-white" : "text-[#0B1B59]/70 hover:bg-[#0B1B59]/[0.06] hover:text-[#0B1B59]"
                }`}
              >
                {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
              </button>
            </div>
            <button
              type="button"
              className={`xl:hidden h-10 w-10 inline-flex cursor-pointer items-center justify-center rounded-full border ${
                isDark ? "border-white/15 text-white" : "border-[#0B1B59]/15 text-[#0B1B59]"
              }`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className={`xl:hidden border-t px-4 py-4 space-y-1 ${
            isDark ? "border-white/[0.08] bg-[#101A2D]" : "border-[#0B1B59]/[0.08] bg-white"
          }`}>
            {MAIN_NAV.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  goPublic(item.page);
                  setOpen(false);
                }}
                className={`w-full cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isDark
                    ? active === item.page ? "bg-white/[0.07] text-white" : "text-white/90"
                    : active === item.page ? "bg-[#0B1B59]/[0.06] text-[#0B1B59]" : "text-[#0B1B59]/75"
                }`}
              >
                {item.label}
              </button>
            ))}
            <details>
              <summary
                className={`flex cursor-pointer list-none items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  DISCOVER_NAV.some((item) => item.page === active)
                    ? isDark ? "bg-[#01AAE4]/[0.12] text-[#8DDEF5]" : "bg-[#0B1B59]/10 text-[#0B1B59]"
                      : isDark ? "text-white/90" : "text-[#0B1B59]/75"
                }`}
              >
                Découvrir
                <ChevronDown size={16} />
              </summary>
              <div className={`ml-3 border-l pl-2 ${isDark ? "border-white/10" : "border-[#0B1B59]/10"}`}>
                {DISCOVER_NAV.map((item) => (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => {
                      goPublic(item.page);
                      setOpen(false);
                    }}
                    className={`w-full cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isDark
                        ? active === item.page ? "text-[#8DDEF5]" : "text-white/85"
                        : active === item.page ? "text-[#0B1B59]" : "text-[#0B1B59]/65"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </details>
            <button
              type="button"
              onClick={() => {
                goPublic("login");
                setOpen(false);
              }}
              className={`w-full cursor-pointer text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                isDark ? "text-white/90" : "text-[#0B1B59]/75"
              }`}
            >
              Connexion
            </button>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/[0.08] bg-[#080D1B] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 sm:py-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-14">
          <div>
            <button type="button" onClick={() => goPublic("home")} className="cursor-pointer">
              <img src="/logo-finx-white.png" alt="FINX Club" className="h-10 w-auto object-contain object-left" />
            </button>
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/55">
              Où l’ambition rencontre l’opportunité. Un GIE présidé par FINX, pour investir, apprendre et progresser.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { label: "Facebook", icon: Facebook, style: "border-[#1877F2]/25 bg-[#1877F2]/[0.12] text-[#78AFFF]" },
                { label: "TikTok", icon: Music2, style: "border-white/15 bg-white/[0.08] text-white" },
                { label: "Instagram", icon: Instagram, style: "border-[#E1306C]/25 bg-gradient-to-br from-[#FCAF45]/[0.12] via-[#E1306C]/[0.14] to-[#833AB4]/[0.18] text-[#F08AB1]" },
              ].map(({ label, icon: Icon, style }) => (
                <span
                  key={label}
                  aria-label={`${label} — lien à ajouter`}
                  title={`${label} — lien à ajouter`}
                  className={`inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border transition-transform hover:scale-105 ${style}`}
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69D2F2]">Explorer</p>
            <div className="space-y-3">
              {[
                ["club", "Le Club"],
                ["devenir-membre", "Adhésion"],
                ["investir", "Programmes"],
                ["evenements", "Événements"],
                ["opportunites", "Opportunités"],
              ].map(([page, label]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goPublic(page as PublicPage)}
                  className="block cursor-pointer text-left text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#69D2F2]">Informations</p>
            <div className="space-y-3">
              {[
                ["partenariats", "Partenariats"],
                ["ressources", "Ressources"],
                ["galerie", "Galerie"],
                ["faq", "FAQ"],
                ["contact", "Contact"],
              ].map(([page, label]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goPublic(page as PublicPage)}
                  className="block cursor-pointer text-left text-[13px] font-medium text-white/55 transition-colors hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.08] py-4">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 text-[11px] text-white/40 sm:px-8 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} FINX Club — Castor, Dakar, Sénégal</p>
            <p className="leading-relaxed">Mentions légales · Confidentialité · Avertissement sur les risques</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageHero({
  kicker,
  title,
  lead,
  actions,
}: {
  kicker?: string;
  title: string;
  lead: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(1,170,228,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 10%, rgba(1,170,228,0.12), transparent 50%), linear-gradient(180deg, #070B18 0%, #05070F 100%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 pt-12 pb-12 md:pt-16 md:pb-14">
        {kicker && (
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4] mb-3">{kicker}</p>
        )}
        <h1 className="max-w-3xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] md:text-[16px] text-white/60 leading-relaxed">{lead}</p>
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}

export function CtaButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "cyan";
}) {
  const { isDark } = useTheme();
  const styles =
    variant === "primary"
      ? "bg-[#01AAE4] text-white"
      : variant === "cyan"
        ? "bg-[#01AAE4] text-white"
        : isDark
          ? "bg-[#141820] border border-white/10 text-white"
          : "bg-white border border-[#0B1B59]/15 text-[#0B1B59] shadow-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 px-6 rounded-full text-sm font-bold inline-flex items-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01AAE4] focus-visible:ring-offset-2 ${styles}`}
    >
      {children}
    </button>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`max-w-6xl mx-auto px-5 py-14 md:py-16 ${className}`}>{children}</section>;
}
