import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { ModeToggle } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import { goPublic } from "../public/publicNav";

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
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Vous n'avez pas de compte ?{" "}
        <button
          type="button"
          onClick={() => goPublic("register")}
          className="text-foreground font-medium underline underline-offset-2 hover:text-primary"
        >
          Créer un compte investisseur
        </button>
      </p>
    </form>
  );
}

function ChangePasswordForm({ compact }: { compact?: boolean }) {
  const { changePassword, logout, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La confirmation ne correspond pas.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const message = await changePassword(currentPassword, newPassword);
    setError(message);
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className={compact ? "w-full" : "w-full max-w-[420px]"}>
      <p className="font-mono text-[10px] text-primary tracking-[0.28em] uppercase mb-3">Sécurité</p>
      <h2 className="font-display text-3xl font-bold text-foreground uppercase tracking-wide">
        Nouveau mot de passe
      </h2>
      <p className="text-sm text-muted-foreground mt-2 mb-8">
        Première connexion pour {user?.email}. Choisissez un mot de passe personnel avant d’accéder à l’espace membres.
      </p>

      <label className="block space-y-1.5 mb-4">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Mot de passe temporaire</span>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full h-11 rounded-lg border border-border bg-card pl-10 pr-11 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      <label className="block space-y-1.5 mb-4">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Nouveau mot de passe</span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="block space-y-1.5 mb-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Confirmer</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
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
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Enregistrer <ArrowRight size={16} /></>}
      </button>
      <button
        type="button"
        onClick={logout}
        className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Se déconnecter
      </button>
    </form>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
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
        <button type="button" onClick={() => goPublic("home")} className="flex items-center gap-3">
          <img src="/symbol-finx.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-7 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goPublic("register")}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider text-white/80 hover:text-white"
          >
            Inscription
          </button>
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] finx-card bg-card rounded-[1.35rem] shadow-[0_30px_80px_rgba(0,0,0,0.28)] overflow-hidden">
          <div className="h-1.5 bg-[#F5D251]" />
          <div className="px-8 pt-8 pb-9">
            <div className="flex items-center gap-3 mb-6">
              <img src="/symbol-finx.png" alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="font-mono text-[9px] tracking-[0.28em] text-[#01AAE4] uppercase">Club privé</p>
                <p className="font-display text-sm font-bold text-foreground uppercase tracking-wide">Espace membres</p>
              </div>
            </div>
            {children}
          </div>
        </div>
      </main>

      <p className="relative z-10 pb-6 text-center font-mono text-[10px] text-white/35 tracking-wider">
        © {new Date().getFullYear()} FINX CLUB
      </p>
    </div>
  );
}

export function LoginPage() {
  return (
    <AuthShell>
      <LoginForm compact />
    </AuthShell>
  );
}

export function ForceChangePasswordPage() {
  return (
    <AuthShell>
      <ChangePasswordForm compact />
    </AuthShell>
  );
}
