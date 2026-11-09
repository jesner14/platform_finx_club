import { useState, type ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api, ApiError } from "../api";
import { ModeToggle } from "../theme/ThemeContext";
import { goPublic } from "./publicNav";

type FormState = {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  telephone: string;
};

const EMPTY: FormState = {
  nom: "",
  prenom: "",
  adresse: "",
  email: "",
  telephone: "",
};

export function RegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setError(null);
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.nom.trim()) next.nom = "Obligatoire";
    if (!form.prenom.trim()) next.prenom = "Obligatoire";
    if (!form.adresse.trim()) next.adresse = "Obligatoire";
    if (!form.email.trim()) next.email = "Obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "E-mail invalide";
    if (!form.telephone.trim()) next.telephone = "Obligatoire";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      await api("/api/public/visiteurs", {
        method: "POST",
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          adresse: form.adresse.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
        }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d’envoyer la demande.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#01AAE4]" />
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 h-16">
        <button type="button" onClick={() => goPublic("home")} className="flex items-center gap-2.5">
          <img src="/logo-finx-white.png" alt="FINX CLUB" className="h-8 w-auto object-contain" />
        </button>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <button
            type="button"
            onClick={() => goPublic("login")}
            className="text-sm font-semibold text-white/70 hover:text-white"
          >
            Connexion
          </button>
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

        {done ? (
          <div className="rounded-2xl border border-white/10 bg-[#0E121C] p-8">
            <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4]">Demande reçue</p>
            <h1 className="mt-3 font-display text-2xl font-bold">Merci, {form.prenom.trim() || "votre demande"} est enregistrée</h1>
            <p className="mt-4 text-[15px] text-white/65 leading-relaxed">
              Votre demande d’accès visiteur a bien été transmise. Un administrateur FINX Club la validera prochainement.
              Vous recevrez alors vos identifiants de connexion par e-mail.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goPublic("home")}
                className="h-11 px-5 rounded-full bg-[#01AAE4] text-white text-sm font-bold"
              >
                Retour à l’accueil
              </button>
              <button
                type="button"
                onClick={() => goPublic("login")}
                className="h-11 px-5 rounded-full border border-white/20 text-sm font-semibold"
              >
                Connexion
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0E121C] overflow-hidden">
            <div className="h-1.5 bg-[#01AAE4]" />
            <div className="p-6 md:p-8 space-y-5">
              <div>
                <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4]">Inscription</p>
                <h1 className="mt-2 font-display text-2xl font-bold">Faire une demande d’accès</h1>
                <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
                  Remplissez ce formulaire. Après validation par l’équipe FINX Club, vous accéderez à votre espace
                  visiteur.
                </p>
              </div>

              <Field label="Nom" error={errors.nom}>
                <input
                  className={inputClass(errors.nom)}
                  value={form.nom}
                  onChange={(e) => setField("nom", e.target.value)}
                  autoComplete="family-name"
                />
              </Field>
              <Field label="Prénom" error={errors.prenom}>
                <input
                  className={inputClass(errors.prenom)}
                  value={form.prenom}
                  onChange={(e) => setField("prenom", e.target.value)}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Adresse" error={errors.adresse}>
                <textarea
                  className={`${inputClass(errors.adresse)} min-h-[88px] py-3`}
                  value={form.adresse}
                  onChange={(e) => setField("adresse", e.target.value)}
                  autoComplete="street-address"
                />
              </Field>
              <Field label="Adresse e-mail" error={errors.email}>
                <input
                  type="email"
                  className={inputClass(errors.email)}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label="Numéro de téléphone" error={errors.telephone}>
                <input
                  className={inputClass(errors.telephone)}
                  value={form.telephone}
                  onChange={(e) => setField("telephone", e.target.value)}
                  autoComplete="tel"
                />
              </Field>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="button"
                disabled={saving}
                onClick={() => void submit()}
                className="h-11 px-6 rounded-full bg-[#01AAE4] text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Envoyer ma demande
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-white/50">{label}</span>
      {children}
      {error && <span className="block text-[12px] text-red-400">{error}</span>}
    </label>
  );
}

function inputClass(error?: string) {
  return `w-full h-11 rounded-xl border bg-[#05070F] px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 ${
    error
      ? "border-red-400/60 focus:ring-red-400/30"
      : "border-white/12 focus:border-[#01AAE4] focus:ring-[#01AAE4]/30"
  }`;
}
