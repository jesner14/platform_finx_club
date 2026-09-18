import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { THEME_VERSIONS, useTheme } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="ml-auto flex items-center gap-0.5 p-0.5 rounded-lg border border-border bg-secondary/60">
      {THEME_VERSIONS.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setTheme(v)}
          className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
            theme === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function LoginForm({ compact }: { compact?: boolean }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const message = await login(email, password);
    setError(message);
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className={compact ? "w-full" : "w-full max-w-[420px]"}>
      <p className="font-mono text-[10px] text-primary tracking-[0.28em] uppercase mb-3">Connexion</p>
      <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">
        Bienvenue
      </h2>
      <p className="text-sm text-muted-foreground mt-2 mb-8">
        Identifiez-vous pour rejoindre le tableau de bord du club.
      </p>

      <label className="block space-y-1.5 mb-4">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Identifiant</span>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="identifiant ou e-mail"
            className="w-full h-11 rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </label>

      <label className="block space-y-1.5 mb-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Mot de passe</span>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-11 rounded-lg border border-border bg-card pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-500/10 border border-red-500/25 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full h-11 rounded-lg bg-primary text-primary-foreground font-display font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
      </button>
    </form>
  );
}

function LoginPageV1() {
  return (
    <div className="min-h-screen flex bg-background font-sans" style={{ fontFamily: "'Arimo', system-ui, sans-serif" }}>
      <aside
        className="hidden lg:flex w-[46%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(165deg, #0B1B59 0%, #13266B 45%, #070F33 100%)" }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F5D251]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#01AAE4 1px, transparent 1px), linear-gradient(90deg, #01AAE4 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-[#01AAE4]/20" />
        <div className="absolute -right-10 bottom-28 w-48 h-48 rounded-full border border-[#F5D251]/15" />

        <div className="relative z-10 flex items-center gap-3">
          <img src="/symbol-finx.png" alt="" className="w-11 h-11 rounded-xl object-cover" />
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-8 w-auto object-contain" />
        </div>

        <div className="relative z-10 max-w-md">
          <p className="font-mono text-[10px] tracking-[0.32em] text-[#01AAE4] uppercase mb-4">
            Club d'investissement
          </p>
          <h1 className="font-display text-[2.6rem] font-bold text-white uppercase leading-[1.1] tracking-wide">
            Accéder à
            <br />
            l'espace membres
          </h1>
          <p className="mt-5 text-sm text-[#8FA3C8] leading-relaxed">
            Gouvernance, participations, sessions investisseurs — un même espace pour piloter le club.
          </p>
          <div className="mt-8 flex gap-6">
            {[
              { n: "05", l: "Statuts" },
              { n: "N5", l: "Niveaux" },
              { n: "INV", l: "Sessions" },
            ].map((item) => (
              <div key={item.l}>
                <p className="font-display text-xl font-bold text-[#F5D251]">{item.n}</p>
                <p className="font-mono text-[9px] tracking-widest text-white/45 uppercase">{item.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-mono text-[10px] text-white/35 tracking-wider">
          © {new Date().getFullYear()} FINX CLUB
        </p>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 lg:px-10 h-16">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img src="/symbol-finx.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-foreground tracking-wide uppercase text-sm">FINX CLUB</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}

function LoginPageV2() {
  return (
    <div
      className="min-h-screen relative flex flex-col font-sans overflow-hidden"
      style={{
        fontFamily: "'Arimo', system-ui, sans-serif",
        background: "linear-gradient(160deg, #0B1B59 0%, #13266B 42%, #070F33 100%)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#F5D251]" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#F5D251 1px, transparent 1px), linear-gradient(90deg, #F5D251 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute -left-24 top-24 w-72 h-72 rounded-full border border-[#F5D251]/20" />
      <div className="absolute -right-16 bottom-10 w-96 h-96 rounded-full border border-[#01AAE4]/15" />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 h-16">
        <div className="flex items-center gap-3">
          <img src="/symbol-finx.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-7 w-auto object-contain" />
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] bg-white rounded-[1.35rem] shadow-[0_30px_80px_rgba(0,0,0,0.28)] overflow-hidden">
          <div className="h-1.5 bg-[#F5D251]" />
          <div className="px-8 pt-8 pb-9">
            <div className="flex items-center gap-3 mb-6">
              <img src="/symbol-finx.png" alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="font-mono text-[9px] tracking-[0.28em] text-[#01AAE4] uppercase">Club privé</p>
                <p className="font-display text-sm font-bold text-[#0B1B59] uppercase tracking-wide">Espace membres</p>
              </div>
            </div>
            <LoginForm compact />
          </div>
        </div>
      </main>

      <p className="relative z-10 pb-6 text-center font-mono text-[10px] text-white/35 tracking-wider">
        © {new Date().getFullYear()} FINX CLUB
      </p>
    </div>
  );
}

function LoginPageV3() {
  return (
    <div className="finx-app min-h-screen relative flex flex-col font-sans overflow-hidden" style={{ fontFamily: "'Arimo', system-ui, sans-serif" }}>
      <div className="pointer-events-none absolute -left-16 top-10 h-80 w-80 rounded-full bg-white blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-24 h-72 w-72 rounded-full bg-[#01AAE4]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-white/80 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 h-16">
        <div className="flex items-center gap-3">
          <img src="/symbol-finx.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <img src="/logo-finx.png" alt="FINX CLUB" className="h-7 w-auto object-contain" />
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] finx-card overflow-hidden">
          <div className="h-1.5 bg-white" />
          <div className="px-8 pt-8 pb-9">
            <div className="flex items-center gap-3 mb-6">
              <img src="/symbol-finx.png" alt="" className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/80" />
              <div>
                <p className="font-mono text-[9px] tracking-[0.28em] text-[#01AAE4] uppercase">Club privé</p>
                <p className="font-display text-sm font-bold text-foreground uppercase tracking-wide">Espace membres</p>
              </div>
            </div>
            <LoginForm compact />
          </div>
        </div>
      </main>

      <p className="relative z-10 pb-6 text-center font-mono text-[10px] text-[#0B1B59]/40 tracking-wider">
        © {new Date().getFullYear()} FINX CLUB
      </p>
    </div>
  );
}

export function LoginPage() {
  const { theme } = useTheme();
  if (theme === "v3") return <LoginPageV3 />;
  if (theme === "v2") return <LoginPageV2 />;
  return <LoginPageV1 />;
}
