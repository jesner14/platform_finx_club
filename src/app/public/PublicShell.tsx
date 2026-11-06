import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { MAIN_NAV, goPublic, type PublicPage } from "./publicNav";

export function PublicShell({
  active,
  children,
}: {
  active: PublicPage;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="finx-public min-h-screen bg-[#05070F] text-white">
      <style>{`
        .finx-public { font-family: 'Arimo', system-ui, sans-serif; }
        .finx-public h1, .finx-public h2, .finx-public h3 {
          font-family: 'Barlow', 'Arimo', sans-serif;
          letter-spacing: -0.02em;
          line-height: 1.18;
        }
        .finx-public h1 { font-size: clamp(1.75rem, 3.6vw, 2.65rem) !important; font-weight: 700 !important; }
        .finx-public h2 { font-size: clamp(1.4rem, 2.6vw, 2rem) !important; font-weight: 700 !important; }
        .finx-public h3 { font-size: 1.1rem !important; font-weight: 600 !important; }
      `}</style>

      <div className="bg-[#0B1B59] text-white text-center text-[13px] font-semibold py-2 px-4">
        FINX Club — Où l’ambition rencontre l’opportunité
      </div>

      <header className="sticky top-0 z-40 bg-white text-[#0B1B59] border-b border-[#0B1B59]/08">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-[72px] flex items-center justify-between gap-4">
          <button type="button" onClick={() => goPublic("home")} className="flex items-center shrink-0">
            <img src="/logo-finx.png" alt="FINX CLUB" className="h-10 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <nav className="hidden xl:flex items-center gap-x-3 text-[12.5px] font-semibold text-[#0B1B59]/65">
              {MAIN_NAV.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => goPublic(item.page)}
                  className={`whitespace-nowrap shrink-0 hover:text-[#0B1B59] ${active === item.page ? "text-[#0B1B59]" : ""}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => goPublic("login")}
              className="hidden sm:inline-flex items-center justify-center h-10 px-3 text-sm font-semibold whitespace-nowrap text-[#0B1B59]/70 hover:text-[#0B1B59]"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => goPublic("devenir-membre")}
              className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#0B1B59] text-white text-sm font-bold whitespace-nowrap"
            >
              Devenir membre
            </button>
            <button
              type="button"
              className="xl:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-[#0B1B59]/15"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="xl:hidden border-t border-[#0B1B59]/08 bg-white px-4 py-4 space-y-1">
            {MAIN_NAV.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  goPublic(item.page);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active === item.page ? "bg-[#0B1B59]/35 text-[#0B1B59]" : "text-[#0B1B59]/75"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                goPublic("login");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-[#0B1B59]/75"
            >
              Connexion
            </button>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <p className="font-display text-xl font-bold">FINX Club</p>
            <p className="mt-3 text-[14px] text-white/50 max-w-sm leading-relaxed">
              Où l’ambition rencontre l’opportunité. Un GIE présidé par FINX, pour investir, apprendre et progresser.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#01AAE4] font-bold mb-3">Explorer</p>
            <div className="space-y-2 text-[14px] text-white/55">
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
                  className="block hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#01AAE4] font-bold mb-3">Informations</p>
            <div className="space-y-2 text-[14px] text-white/55">
              {[
                ["partenariats", "Partenariats"],
                ["ressources", "Ressources"],
                ["faq", "FAQ"],
                ["contact", "Contact"],
                ["login", "Connexion"],
              ].map(([page, label]) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goPublic(page as PublicPage)}
                  className="block hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <div className="max-w-6xl mx-auto px-5 flex flex-wrap gap-3 justify-between text-[12px] text-white/35">
            <p>© {new Date().getFullYear()} FINX Club — Castor, Dakar, Sénégal</p>
            <p>Mentions légales · Confidentialité · Avertissement sur les risques</p>
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
  const styles =
    variant === "primary"
      ? "bg-[#01AAE4] text-white"
      : variant === "cyan"
        ? "bg-[#01AAE4] text-white"
        : "bg-[#141820] border border-white/10 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 px-6 rounded-full text-sm font-bold inline-flex items-center ${styles}`}
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
