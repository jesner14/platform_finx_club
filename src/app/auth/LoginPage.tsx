import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";
import { ModeToggle, useTheme } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import { goPublic } from "../public/publicNav";

function inputClass(isDark: boolean) {
  return `w-full h-11 rounded-xl border pl-10 pr-3 text-sm outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30 ${
    isDark
      ? "border-white/12 bg-[#080D18] text-white placeholder:text-white/35"
      : "border-[#0B1B59]/15 bg-white text-[#17213B] placeholder:text-[#7B879A]"
  }`;
}

function LoginForm() {
  const { isDark } = useTheme();
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
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div className="mb-7 text-center">
        <img
          src={isDark ? "/logo-finx-white.png" : "/logoFinxReview.png"}
          alt="FINX Club"
          className="mx-auto mb-3 h-12 w-auto object-contain"
        />
        <p className={`mt-1 text-[12px] ${isDark ? "text-white/55" : "text-[#71809A]"}`}>
          Plateforme d'investissement et d'accompagnement pour les membres du Club FINX
        </p>
        <span className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${
          isDark ? "border-[#01AAE4]/20 bg-[#01AAE4]/[0.1] text-[#9CE3F7]" : "border-[#01AAE4]/15 bg-[#F0FAFD] text-[#087EA4]"
        }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#01AAE4]" />
          Identification
        </span>
      </div>

      <label className="block space-y-2">
        <span className={`text-[12px]  font-medium ${isDark ? "text-white/80" : "text-[#33415D]"}`}>
          Adresse e-mail ou identifiant
        </span>
        <div className="relative mt-1">
          <Mail
            size={15}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/45" : "text-[#7B879A]"}`}
          />
          <input
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@domaine.com"
            className={inputClass(isDark)}
          />
        </div>
      </label>

      <label className="block space-y-2">
        <span className={`text-[12px] font-medium ${isDark ? "text-white/80" : "text-[#33415D]"}`}>
          Mot de passe
        </span>
        <div className="relative mt-1">
          <Lock
            size={15}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/45" : "text-[#7B879A]"}`}
          />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass(isDark)} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDark ? "text-white/45 hover:text-white" : "text-[#7B879A] hover:text-[#0B1B59]"
            }`}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#070055] text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(98,86,245,0.65)] transition-colors hover:bg-[#05003f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6256F5] focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Se connecter <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className={`pt-1 text-center text-[12px] ${isDark ? "text-white/60" : "text-[#65718A]"}`}>
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
  const { isDark } = useTheme();
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
        <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4]">
          Sécurité
        </p>
        <h1 className={`mt-2 font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
          Nouveau mot de passe
        </h1>
        <p className={`mt-2 text-[14px] leading-relaxed ${isDark ? "text-white/60" : "text-[#5A6780]"}`}>
          Première connexion pour {user?.email}. Choisissez un mot de passe
          personnel avant d’accéder à votre espace.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-white/60" : "text-[#53627E]"}`}>
          Mot de passe temporaire
        </span>
        <div className="relative">
          <Lock
            size={15}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/45" : "text-[#7B879A]"}`}
          />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`${inputClass(isDark)} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              isDark ? "text-white/45 hover:text-white" : "text-[#7B879A] hover:text-[#0B1B59]"
            }`}
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-white/60" : "text-[#53627E]"}`}>
          Nouveau mot de passe
        </span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 text-sm outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30 ${
            isDark ? "border-white/12 bg-[#080D18] text-white" : "border-[#0B1B59]/15 bg-white text-[#17213B]"
          }`}
        />
      </label>

      <label className="block space-y-1.5">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${isDark ? "text-white/60" : "text-[#53627E]"}`}>
          Confirmer
        </span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`w-full h-11 rounded-xl border px-3 text-sm outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/30 ${
            isDark ? "border-white/12 bg-[#080D18] text-white" : "border-[#0B1B59]/15 bg-white text-[#17213B]"
          }`}
        />
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-full bg-[#01AAE4] text-white text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Enregistrer <ArrowRight size={16} />
          </>
        )}
      </button>
      <button
        type="button"
        onClick={logout}
        className={`w-full text-center text-[13px] underline underline-offset-2 ${
          isDark ? "text-white/55 hover:text-white" : "text-[#65718A] hover:text-[#0B1B59]"
        }`}
      >
        Se déconnecter
      </button>
    </form>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen overflow-hidden ${
      isDark ? "bg-[#080D18] text-white" : "bg-[#F4F7FB] text-[#17213B]"
    }`}>
      <main className="grid min-h-screen lg:grid-cols-[minmax(420px,0.82fr)_1.18fr]">
        <section className={`relative flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-14 xl:px-20 ${
          isDark ? "bg-[#101522]" : "bg-white"
        }`}>
          <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center">
            <div className="w-full py-4 sm:px-2">
              {children}
            </div>
          </div>
          <p className={`mx-auto mt-8 w-full max-w-[440px] text-center text-[11px] ${
            isDark ? "text-white/35" : "text-[#8792A5]"
          }`}>
            © {new Date().getFullYear()} FINX Club
          </p>
        </section>

        <aside className="relative isolate min-h-[300px] overflow-hidden bg-[#07101F] sm:min-h-[380px] lg:min-h-screen">
          <img
            src="/resources/images/investissement.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#05070F]/95 via-[#05070F]/65 to-[#05070F]/25 lg:bg-gradient-to-r lg:from-[#07101F]/90 lg:via-[#07101F]/45 lg:to-[#07101F]/30"
          />
          <div className="relative flex min-h-[300px] h-full flex-col justify-end px-7 py-9 sm:min-h-[380px] sm:px-12 sm:py-12 lg:min-h-screen lg:justify-center lg:px-14 xl:px-20">
            <div className="max-w-xl">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#69D2F2] sm:text-[11px]">
                FINX Club · Investir avec discernement
              </p>
              <h2 className="text-[clamp(1.8rem,3.8vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                Vos ambitions méritent un cadre solide.
              </h2>
              <p className="mt-4 max-w-lg text-[13px] leading-6 text-white/75 sm:text-[14px] sm:leading-7">
                Retrouvez votre espace pour suivre votre parcours, accéder aux informations de votre compte et avancer
                au sein de la communauté FINX.
              </p>
            </div>
            <div className="mt-9 flex items-center gap-3 text-[11px] font-medium text-white/55">
              <span className="h-px w-8 bg-[#01AAE4]" />
              Investir · apprendre · progresser
            </div>
          </div>
        </aside>
      </main>
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
