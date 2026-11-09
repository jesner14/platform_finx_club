import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { ModeToggle } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import { goPublic } from "../public/publicNav";

const inputClass =
  "w-full h-11 rounded-xl border border-white/12 bg-[#05070F] pl-10 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30";

function LoginForm() {
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
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div>
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4]">Connexion</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Bienvenue</h1>
        <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
          Identifiez-vous pour accéder à votre espace FINX Club.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Identifiant</span>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="identifiant ou e-mail"
            className={inputClass}
          />
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Mot de passe</span>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-full bg-[#01AAE4] text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
      </button>

      <p className="text-center text-[13px] text-white/50">
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={() => goPublic("register")}
          className="text-[#01AAE4] font-semibold hover:underline"
        >
          Faire une demande
        </button>
      </p>
    </form>
  );
}

function ChangePasswordForm() {
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
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div>
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4]">Sécurité</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Nouveau mot de passe</h1>
        <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
          Première connexion pour {user?.email}. Choisissez un mot de passe personnel avant d’accéder à votre espace.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Mot de passe temporaire</span>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Nouveau mot de passe</span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full h-11 rounded-xl border border-white/12 bg-[#05070F] px-3 text-sm text-white focus:outline-none focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">Confirmer</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-11 rounded-xl border border-white/12 bg-[#05070F] px-3 text-sm text-white focus:outline-none focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30"
        />
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-full bg-[#01AAE4] text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Enregistrer <ArrowRight size={16} /></>}
      </button>
      <button
        type="button"
        onClick={logout}
        className="w-full text-center text-[13px] text-white/50 hover:text-white underline underline-offset-2"
      >
        Se déconnecter
      </button>
    </form>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070F] text-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#01AAE4]" />
      <div
        className="absolute inset-0 opacity-90 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(1,170,228,0.16), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(11,27,89,0.55), transparent 50%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 h-16">
        <button type="button" onClick={() => goPublic("home")} className="flex items-center shrink-0">
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-10 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goPublic("register")}
            className="text-sm font-semibold text-white/70 hover:text-white"
          >
            Inscription
          </button>
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-5 py-10 md:py-14">
        <button
          type="button"
          onClick={() => goPublic("home")}
          className="mb-5 inline-flex items-center gap-2 text-xs text-[#01AAE4] hover:underline"
        >
          <ArrowLeft size={14} /> Retour au site
        </button>

        <div className="rounded-2xl border border-white/10 bg-[#0E121C] overflow-hidden">
          <div className="h-1.5 bg-[#01AAE4]" />
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </main>

      <p className="relative z-10 pb-6 text-center text-[12px] text-white/35">
        © {new Date().getFullYear()} FINX Club
      </p>
    </div>
  );
}

export function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}

export function ForceChangePasswordPage() {
  return (
    <AuthShell>
      <ChangePasswordForm />
    </AuthShell>
  );
}
