import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Headphones,
  Landmark,
  Layers,
  LineChart,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { goPublic } from "./publicNav";

const NAV = [
  { href: "#offre", label: "Offre" },
  { href: "#parcours", label: "Parcours" },
  { href: "#marche", label: "Marché" },
  { href: "#club", label: "Club" },
];

const BENEFITS = [
  { icon: Clock3, title: "Espace membres", text: "Suivi des parts et de la VL" },
  { icon: BadgeCheck, title: "Frais clairs", text: "Règles et statuts du club" },
  { icon: Headphones, title: "Gouvernance", text: "Sessions et rôles définis" },
];

const STATS = [
  { value: "05", suffix: "", label: "Statuts membres" },
  { value: "N1–N5", suffix: "", label: "Niveaux de parcours" },
  { value: "BRVM", suffix: "", label: "Référence de place" },
  { value: "18 h", suffix: "", label: "Session sécurisée" },
];

const AWARDS = [
  { kicker: "Gouvernance", title: "Rôles & statuts", note: "Matrice claire" },
  { kicker: "Marché", title: "BRVM", note: "Lignes suivies" },
  { kicker: "Parts", title: "Valeur liquidative", note: "Historique daté" },
  { kicker: "Club", title: "Sessions 18 h", note: "Espace sécurisé" },
];

const MARKETS = [
  {
    id: "club",
    title: "Club",
    text: "Investissement collectif, dépôts, retraits et solde de parts dans un même espace.",
  },
  {
    id: "marche",
    title: "Marché",
    text: "Portefeuille suivi, valeur liquidative et historiques de performances du club.",
  },
] as const;

const OFFERS = {
  club: [
    {
      icon: Star,
      name: "Invité",
      lead: "Découverte du club. Accédez à la présentation et préparez votre entrée.",
      points: ["Accès limité à la présentation", "En attente de validation", "Idéal pour découvrir le parcours"],
    },
    {
      icon: Sparkles,
      name: "Membre simple",
      lead: "Entrée dans le club. Suivez vos dépôts et consultez la VL.",
      points: ["Suivi de vos dépôts", "Consultation de la VL", "Progression vers le niveau suivant"],
    },
    {
      icon: Layers,
      name: "Confirmé",
      lead: "Engagement régulier. Historiques complets et sessions du club.",
      points: ["Historiques complets", "Sessions réservées", "Engagement mensuel du club"],
    },
    {
      icon: Zap,
      name: "Investisseur",
      lead: "Badge capital. Seuil atteint et lecture élargie du portefeuille.",
      points: ["Seuil de capital atteint", "Lecture du portefeuille", "Pilotage élargi selon le rôle"],
    },
  ],
  marche: [
    {
      icon: LineChart,
      name: "Valeur liquidative",
      lead: "Prix de la part. Historique daté, actif net et nombre de parts.",
      points: ["Historique daté", "Actif net et nombre de parts", "Visible selon les paramètres"],
    },
    {
      icon: Landmark,
      name: "Portefeuille",
      lead: "Lignes BRVM. Symboles, titres et secteurs dans un catalogue partagé.",
      points: ["Symbole, titre, secteur", "Catalogue partagé", "Consultation membres"],
    },
    {
      icon: Shield,
      name: "Gouvernance",
      lead: "Rôles et écrans. Matrice de privilèges et niveaux N1 à N5.",
      points: ["Matrice de privilèges", "Fonctions de club", "Niveaux N1 à N5"],
    },
    {
      icon: BadgeCheck,
      name: "Historiques",
      lead: "Trois séries. Performances, montants investis et capitaux nets.",
      points: ["Performances", "Montants investis", "Capitaux nets"],
    },
  ],
};

function FanGraphic() {
  return (
    <div className="relative mx-auto mt-8 h-[320px] w-full max-w-4xl" aria-hidden>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#05070F] via-[#05070F]/80 to-transparent z-10" />
      {Array.from({ length: 13 }, (_, i) => {
        const angle = -60 + i * 10;
        const mid = Math.abs(i - 6);
        const height = 230 - mid * 8;
        return (
          <span
            key={i}
            className="absolute left-1/2 bottom-10 origin-bottom rounded-t-[6px]"
            style={{
              width: 34,
              height,
              transform: `translateX(-50%) rotate(${angle}deg)`,
              background: `linear-gradient(180deg, #2A3358 0%, #121A38 40%, #070C1C 100%)`,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.45)",
            }}
          />
        );
      })}
    </div>
  );
}

export function PublicSite() {
  const [market, setMarket] = useState<(typeof MARKETS)[number]["id"]>("club");
  const start = () => goPublic("register");

  return (
    <div className="finx-public min-h-screen bg-[#05070F] text-white">
      <style>{`
        .finx-public { font-family: 'Arimo', system-ui, sans-serif; }
        .finx-public h1, .finx-public h2, .finx-public h3 {
          font-family: 'Barlow', 'Arimo', sans-serif;
          letter-spacing: -0.04em;
          line-height: 1.05;
        }
        .finx-public h1 { font-size: clamp(2.6rem, 8vw, 5.4rem) !important; font-weight: 800 !important; }
        .finx-public h2 { font-size: clamp(2rem, 5vw, 3.4rem) !important; font-weight: 800 !important; }
        .finx-public h3 { font-size: 1.35rem !important; font-weight: 800 !important; }
        .finx-public button { letter-spacing: 0; }
      `}</style>

      <div className="bg-[#F5D251] text-[#0B1B59] text-center text-[13px] font-semibold py-2 px-4">
        Club d’investissement · Parts, VL et gouvernance — espace membres sécurisé
      </div>

      <header className="sticky top-0 z-30 bg-white text-[#0B1B59]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-[72px] flex items-center gap-4 lg:gap-8">
          <a href="#accueil" className="flex items-center gap-2.5 shrink-0">
            <img src="/symbol-finx.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
            <img src="/logo-finx.png" alt="FINX CLUB" className="h-7 w-auto object-contain hidden sm:block" />
          </a>
          <nav className="hidden lg:flex items-center gap-7 flex-1 text-[15px] font-semibold text-[#0B1B59]/65">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#0B1B59]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={start}
              className="h-10 px-3 text-sm font-semibold text-[#0B1B59]/70 hover:text-[#0B1B59]"
            >
              Inscription
            </button>
            <button
              type="button"
              onClick={() => goPublic("login")}
              className="h-11 px-5 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold"
            >
              Connexion
            </button>
          </div>
        </div>
      </header>

      <section id="accueil" className="relative overflow-hidden px-5 pt-20 pb-2 text-center">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#12161F] px-4 py-2 text-[13px] text-white/70 mb-10">
          <span className="text-[#F5D251] tracking-tight">★★★★★</span>
          Club privé · présentation par défaut
          <span className="text-[#01AAE4]">· FINX</span>
        </div>
        <h1 className="font-bold text-[2.75rem] sm:text-[4.25rem] lg:text-[5.25rem] max-w-5xl mx-auto">
          Nous structurons
          <br />
          votre parcours
          <br />
          d’investisseur
        </h1>
        <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-6 text-left max-w-4xl mx-auto">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3 min-w-[13rem]">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#01AAE4]/15 text-[#01AAE4]">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold">{item.title}</p>
                  <p className="text-[13px] text-white/45">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={start}
            className="h-14 px-10 rounded-full bg-[#F5D251] text-[#0B1B59] text-[16px] font-bold"
          >
            Commencer
          </button>
          <a
            href="#club"
            className="h-14 px-10 rounded-full bg-[#141820] border border-white/8 text-white text-[16px] font-bold inline-flex items-center"
          >
            Comment ça fonctionne
          </a>
        </div>
        <FanGraphic />
      </section>

      <section className="max-w-6xl mx-auto px-5 pt-2 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#0E121C] border border-white/5 px-5 py-7">
              <p className="font-display text-[2rem] font-extrabold text-white leading-none">{item.value}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="offre" className="max-w-6xl mx-auto px-5 py-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
        <div>
          <h2 className="text-4xl sm:text-5xl font-extrabold">Reconnu pour sa clarté</h2>
          <p className="mt-5 text-[15px] text-white/50 leading-relaxed max-w-md">
            FINX CLUB présente un club d’investissement avec statuts, niveaux et écran membres.
            Les chiffres et mentions de cette page sont des contenus par défaut, pour la démonstration.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AWARDS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-[#0E121C] border border-white/5 px-5 py-6 min-h-[132px]">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#F5D251]">{item.kicker}</p>
              <p className="mt-2 font-display text-lg font-bold">{item.title}</p>
              <p className="mt-1 text-[13px] text-white/40">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="marche" className="max-w-6xl mx-auto px-5 py-8">
        <h2 className="text-4xl sm:text-[3.4rem] font-extrabold mb-10">
          Choisissez
          <br />
          votre marché
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {MARKETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMarket(item.id)}
              className={`text-left rounded-[1.75rem] p-8 transition-colors ${
                market === item.id ? "bg-[#F5D251] text-[#0B1B59]" : "bg-[#0E121C] text-white border border-white/5"
              }`}
            >
              <p className="font-display text-[1.75rem] font-extrabold">{item.title}</p>
              <p className={`mt-3 text-[15px] leading-relaxed ${market === item.id ? "text-[#0B1B59]/70" : "text-white/50"}`}>
                {item.text}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section id="parcours" className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-[#0E121C] p-1.5 border border-white/10">
            {MARKETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMarket(item.id)}
                className={`h-12 px-7 rounded-full text-sm font-bold inline-flex items-center gap-2 ${
                  market === item.id ? "bg-[#F5D251] text-[#0B1B59]" : "text-white/70"
                }`}
              >
                {item.title}
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {OFFERS[market].map((offer) => {
            const Icon = offer.icon;
            return (
              <article key={offer.name} className="rounded-[1.75rem] bg-[#0E121C] border border-white/5 p-6 flex flex-col">
                <div className="h-[72px] w-[72px] rounded-2xl bg-gradient-to-br from-[#2A3358] to-[#0B1020] border border-white/10 flex items-center justify-center text-[#F5D251] mb-6 shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
                  <Icon size={28} />
                </div>
                <h3 className="text-[1.35rem] font-extrabold">{offer.name}</h3>
                <p className="mt-2 text-[14px] text-white/45 leading-relaxed">{offer.lead}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {offer.points.map((point) => (
                    <li key={point} className="flex gap-2 text-[14px] text-white/65">
                      <span className="text-[#F5D251] mt-0.5">›</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={start}
                    className="h-10 px-4 rounded-full bg-[#1A2030] text-sm font-semibold hover:bg-[#F5D251] hover:text-[#0B1B59]"
                  >
                    Commencer
                  </button>
                  <a href="#club" className="text-sm text-white/50 hover:text-white inline-flex items-center gap-1">
                    Découvrir <ArrowRight size={13} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-6">
        <p className="text-3xl sm:text-4xl font-extrabold mb-6">Quoi de neuf</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {["Club · statuts", "Marché · VL", "Gouvernance", "Espace membres"].map((chip, i) => (
            <span
              key={chip}
              className={`h-9 px-4 rounded-full text-[13px] font-semibold inline-flex items-center ${
                i === 0 ? "bg-[#F5D251] text-[#0B1B59]" : "bg-[#141820] border border-white/10 text-white/70"
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="rounded-[2rem] overflow-hidden min-h-[300px] p-8 md:p-12 relative bg-gradient-to-r from-[#0B1B59] via-[#16307A] to-[#E8EDF6]">
          <p className="inline-flex items-center rounded-full bg-[#01AAE4]/20 text-[#01AAE4] text-[11px] font-bold uppercase tracking-wider px-3 py-1">
            Club
          </p>
          <h2 className="mt-5 text-4xl md:text-5xl font-extrabold max-w-lg">
            Rejoindre
            <br />
            FINX CLUB
          </h2>
          <p className="mt-4 text-[15px] text-white/70 max-w-md">
            Commencez une demande de compte investisseur. La page d’inscription sera complétée ensuite.
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-8 h-12 px-6 rounded-full bg-[#F5D251] text-[#0B1B59] text-sm font-bold"
          >
            Commencer
          </button>
          <div
            className="absolute right-[-20px] bottom-[-40px] w-[280px] h-[220px] rounded-[2rem] rotate-[-18deg] opacity-80 hidden md:block"
            style={{
              background: "linear-gradient(135deg, #F5D251 0%, #01AAE4 55%, #0B1B59 100%)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            }}
            aria-hidden
          />
        </div>
      </section>

      <section id="club" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-10">Comment ça fonctionne</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { n: "01", t: "Inscription", d: "Demandez un compte investisseur." },
            { n: "02", t: "Validation", d: "Le club ouvre votre fiche membre." },
            { n: "03", t: "Dépôts", d: "Vos parts et historiques se mettent à jour." },
            { n: "04", t: "Pilotage", d: "VL, portefeuille, sessions et rôles." },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl bg-[#0E121C] border border-white/5 p-6">
              <p className="font-display text-3xl font-extrabold text-[#F5D251]">{step.n}</p>
              <p className="mt-4 text-lg font-bold">{step.t}</p>
              <p className="mt-2 text-[14px] text-white/45">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-7">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/40">
          <p>© {new Date().getFullYear()} FINX CLUB — Présentation par défaut</p>
          <div className="flex gap-5">
            <button type="button" onClick={start} className="hover:text-white">
              Inscription
            </button>
            <button type="button" onClick={() => goPublic("login")} className="hover:text-white">
              Connexion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
