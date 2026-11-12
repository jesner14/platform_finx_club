import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  GraduationCap,
  Handshake,
  LineChart,
  Mail,
  MapPin,
  Phone,
  Plane,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CtaButton, PageHero, Section } from "./PublicShell";
import { useTheme } from "../theme/ThemeContext";
import { goPublic } from "./publicNav";

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex h-8 items-center rounded-full border border-white/10 bg-white/5 px-3 text-[12px] font-semibold text-white/70">
      {children}
    </span>
  );
}

export function ClubPage() {
  return (
    <>
      <PageHero
        kicker="Le Club"
        title="À propos de FINX Club"
        lead="FINX Club est un club d’investissement constitué sous la forme d’un Groupement d’Intérêt Économique (GIE). Présidé par FINX, il rassemble une communauté d’investisseurs et de talents autour de projets d’investissement, de rencontres professionnelles, d’initiatives pédagogiques et de partenariats."
      />
      <Section>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2>Notre vision</h2>
            <p className="mt-4 text-white/55 leading-relaxed">
              Faire émerger une communauté de référence en Afrique de l’Ouest, capable de conjuguer intelligence
              collective, culture financière et accès à des opportunités concrètes. Notre ambition continentale
              s’appuie sur une conviction : la connaissance, la discipline et la coopération créent des conditions
              favorables à une progression durable.
            </p>
          </div>
          <div>
            <h2>Notre mission</h2>
            <p className="mt-4 text-white/55 leading-relaxed">
              Faciliter la découverte des programmes d’investissement, encourager l’éducation financière, connecter
              les membres aux acteurs académiques et professionnels et accompagner la participation à la vie du Club.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <h3 className="text-[#01AAE4]">Nos valeurs</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Confiance",
              "Transparence",
              "Discipline",
              "Expertise",
              "Progression",
              "Esprit de communauté",
              "Ouverture à la jeunesse africaine",
            ].map((v) => (
              <Pill key={v}>{v}</Pill>
            ))}
          </div>
        </div>
        <div className="mt-12 rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7 md:p-9">
          <h3>Gouvernance</h3>
          <p className="mt-3 text-white/55 leading-relaxed max-w-3xl">
            La gouvernance du Club s’appuie sur une organisation structurée, avec des fonctions et responsabilités
            attribuées selon les règles internes. Le site public présente les instances, les responsables et les
            documents institutionnels dont la diffusion est autorisée.
          </p>
        </div>
      </Section>
    </>
  );
}

export function DevenirMembrePage() {
  const statuses = [
    {
      title: "Visiteur",
      text: "Découvrez le Club, consultez les événements publics et demandez votre adhésion.",
    },
    {
      title: "Membre simple",
      text: "Participez à la communauté, aux activités et à certaines ressources du Club.",
    },
    {
      title: "Membre actif",
      text: "Faites évoluer votre statut grâce à votre participation aux activités éligibles. Le parcours prévoit des niveaux progressifs et des privilèges associés.",
    },
    {
      title: "Membre confirmé",
      text: "Après six participations éligibles et sous réserve des conditions du Club, accédez à un statut permanent et à des avantages renforcés.",
    },
    {
      title: "Membre investisseur",
      text: "Un badge spécifique est attribué aux personnes ayant investi au moins 1 000 000 FCFA. Ce statut peut être indépendant des autres catégories d’adhésion.",
    },
  ];

  return (
    <>
      <PageHero
        kicker="Adhésion"
        title="Rejoignez une communauté qui évolue avec vous"
        lead="FINX Club accueille les personnes désireuses de découvrir l’investissement, d’approfondir leurs connaissances et de participer à une dynamique académique et professionnelle. L’adhésion ouvre l’accès à la vie du Club et à des avantages définis selon le statut du membre."
        actions={
          <>
            <CtaButton onClick={() => goPublic("register")}>Faire une demande d’adhésion</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("faq")}>
              Consulter les statuts
            </CtaButton>
          </>
        }
      />
      <Section>
        <h2>Les différents statuts</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {statuses.map((s) => (
            <article key={s.title} className="rounded-[1.4rem] border border-white/10 bg-[#0E121C] p-6">
              <h3>{s.title}</h3>
              <p className="mt-3 text-[14px] text-white/55 leading-relaxed">{s.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12">
          <h2>Comment rejoindre FINX Club ?</h2>
          <ol className="mt-6 space-y-4">
            {[
              "Découvrez les activités et les conditions d’adhésion.",
              "Créez votre compte et transmettez votre demande.",
              "Participez aux activités et suivez l’évolution de votre statut depuis votre espace personnel.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4 items-start">
                                <span className="font-display text-xl font-bold text-[#01AAE4]">{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1 text-white/65">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}

export function InvestirPage() {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section className={`finx-invest-hero px-4 py-5 sm:px-7 sm:py-7 ${
        isDark ? "bg-[#0C1426]" : "bg-[#F4F7FB]"
      }`}>
        <div className={`mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] border shadow-[0_28px_80px_-40px_rgba(5,12,30,0.5)] lg:grid-cols-[1.03fr_0.97fr] ${
          isDark ? "border-white/[0.08] bg-[#101A2D]" : "border-[#0B1B59]/[0.08] bg-white"
        }`}>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
            className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
          >
            <p className={`mb-4 inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px] ${
              isDark ? "text-[#69D2F2]" : "text-[#087EA4]"
            }`}>
              <LineChart size={15} strokeWidth={1.8} />
              Programmes d’investissement
            </p>
            <h1 className={isDark ? "text-white" : "text-[#0B1B59]"}>
              Investir avec méthode, comprendre avant de s’engager
            </h1>
            <p className={`mt-5 max-w-xl text-[13px] leading-6 sm:text-[14px] sm:leading-7 ${
              isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
            }`}>
              FINX Club présente plusieurs univers d’investissement. Chaque programme possède ses propres objectifs,
              modalités, documents d’information, risques et conditions de participation. L’accès à l’investissement
              reste distinct de l’adhésion au Club.
            </p>
            <div className={`mt-6 flex items-start gap-3 border-t pt-5 text-[11px] leading-5 sm:text-[12px] ${
              isDark ? "border-white/[0.09] text-white/55" : "border-[#0B1B59]/[0.09] text-[#6A768C]"
            }`}>
              <ShieldAlert className={`mt-0.5 shrink-0 ${isDark ? "text-[#69D2F2]" : "text-[#087EA4]"}`} size={16} />
              <span>Les investissements comportent des risques. Aucun rendement n’est garanti.</span>
            </div>
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
            className="relative min-h-[230px] overflow-hidden sm:min-h-[300px] lg:min-h-[500px]"
          >
            <img
              src="/resources/images/investissement.png"
              alt="Graphiques illustrant l’évolution des marchés financiers"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07101F]/65 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#101A2D]/35 lg:via-transparent lg:to-transparent"
            />
          </motion.div>
        </div>
      </section>
      <Section>
        <div className="grid lg:grid-cols-2 gap-5">
          <article className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-[#0E121C] to-[#0B1B59]/40 p-7 md:p-8">
            <LineChart className="text-[#01AAE4]" size={28} />
            <h3 className="mt-5 text-xl">FINX Bourse</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              Découvrez un univers d’investissement lié aux marchés financiers à travers un portefeuille commun. Les
              investisseurs habilités peuvent accéder, dans leur espace sécurisé, aux informations sur leurs parts, la
              valorisation, les opérations et les reportings périodiques.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <CtaButton onClick={() => goPublic("parcours-investisseur")}>Découvrir FINX Bourse</CtaButton>
              <CtaButton variant="ghost" onClick={() => goPublic("register")}>
                Commencer mon parcours investisseur
              </CtaButton>
            </div>
          </article>
          <article className="rounded-[1.6rem] border border-white/10 bg-[#0E121C] p-7 md:p-8">
            <Building2 className="text-[#01AAE4]" size={28} />
            <h3 className="mt-5 text-xl">FINX Transport</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              Participez à la découverte de notre portefeuille transport financé de manière participative. Le projet est
              présenté avec son objectif de financement, sa durée, ses hypothèses économiques, ses risques et son état
              d’avancement.
            </p>
            <div className="mt-7">
              <CtaButton variant="cyan" onClick={() => goPublic("contact")}>
                Explorer FINX Transport
              </CtaButton>
            </div>
          </article>
        </div>
        <div className="mt-10 rounded-[1.4rem] border border-[#01AAE4]/25 bg-[#0B1B59]/08 p-6 md:p-7 flex gap-4">
          <ShieldAlert className="text-[#01AAE4] shrink-0 mt-1" size={22} />
          <div>
            <h3 className="text-[#01AAE4]">Information essentielle</h3>
            <p className="mt-2 text-[14px] text-white/70 leading-relaxed">
              Tout investissement comporte des risques, notamment un risque de perte en capital. Les performances
              passées ne préjugent pas des performances futures. Aucun rendement n’est garanti. Les documents
              contractuels et les conditions applicables doivent être consultés avant toute décision.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

export function ParcoursInvestisseurPage() {
  return (
    <>
      <PageHero
        kicker="Parcours investisseur"
        title="Un parcours structuré, de la découverte au suivi"
        lead="Pour FINX Bourse, la démarche de souscription est conçue pour permettre la constitution et la vérification d’un dossier en ligne : création de compte, profil investisseur, transmission des pièces justificatives, signature des documents, contrôle administratif et validation."
        actions={
          <>
            <CtaButton onClick={() => goPublic("register")}>Démarrer ma souscription</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("login")}>
              Me connecter
            </CtaButton>
          </>
        }
      />
      <Section>
        <p className="text-white/55 leading-relaxed max-w-3xl">
          Une fois le dossier validé et l’investissement activé, l’investisseur peut accéder à son espace personnel
          sécurisé pour consulter les données et documents mis à sa disposition.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Création de compte",
            "Profil & pièces",
            "Signature & contrôle",
            "Espace sécurisé",
          ].map((step, i) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-[#0E121C] p-5">
              <p className="font-display text-xl font-bold text-[#01AAE4]">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-3 font-semibold">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-[14px] text-white/45 max-w-3xl leading-relaxed">
          Les formulaires, documents d’identité, signatures, données financières personnelles et demandes de retrait
          ne sont pas accessibles sur le site vitrine : ils relèvent exclusivement des espaces sécurisés.
        </p>
      </Section>
    </>
  );
}

export function EvenementsPage() {
  return (
    <>
      <PageHero
        kicker="L’Instant Invest & événements"
        title="Des rencontres pour comprendre, échanger et progresser"
        lead="Avec L’Instant Invest, FINX, société présidente de FINX Club, propose gratuitement des conférences, masterclass, webinaires et podcast autour des marchés financiers, de l’investissement et des enjeux économiques."
        actions={
          <>
            <CtaButton onClick={() => goPublic("contact")}>Voir les prochains événements</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("register")}>
              S’inscrire
            </CtaButton>
          </>
        }
      />
      <Section>
        <p className="text-white/55 leading-relaxed max-w-3xl">
          Ces rencontres permettent de dialoguer avec des intervenants et de développer ses connaissances. Consultez
          les prochaines dates, découvrez les intervenants et inscrivez-vous en ligne. Lorsque les places sont limitées,
          les membres bénéficient d’une priorité d’inscription.
        </p>
        <div className="mt-12">
          <h2>La vie du Club</h2>
          <p className="mt-4 text-white/55 leading-relaxed max-w-3xl">
            Au-delà des événements financiers, FINX Club cultive les échanges à travers des activités de cohésion :
            rencontres professionnelles, visites d’entreprises, excursions, activités culturelles, sportives et de
            networking. Retrouvez le calendrier et les modalités de participation.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, t: "Conférences & masterclass" },
              { icon: Users, t: "Networking & cohésion" },
              { icon: Building2, t: "Visites d’entreprises" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.t} className="rounded-2xl border border-white/10 bg-[#0E121C] p-6">
                  <Icon className="text-[#01AAE4]" size={22} />
                  <p className="mt-4 font-semibold">{item.t}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}

export function OpportunitesPage() {
  return (
    <>
      <PageHero
        kicker="Opportunités"
        title="Une communauté, des perspectives à explorer"
        lead="FINX Club souhaite rapprocher le monde académique, les entreprises et les membres de sa communauté. Selon les programmes disponibles, les membres peuvent découvrir des bourses, stages, mentorat, visites et programmes d’ambassadeurs."
        actions={<CtaButton onClick={() => goPublic("contact")}>Consulter les opportunités</CtaButton>}
      />
      <Section>
        <div className="grid md:grid-cols-2 gap-5">
          <article className="rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7">
            <GraduationCap className="text-[#01AAE4]" size={26} />
            <h3 className="mt-4">Opportunités académiques et professionnelles</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              Bourses de formation, réductions, stages, mentorat, visites d’entreprises, rencontres professionnelles et
              programmes d’ambassadeurs. Chaque opportunité publiée présente ses objectifs, critères d’éligibilité,
              modalités de candidature et date limite.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7">
            <Plane className="text-[#01AAE4]" size={26} />
            <h3 className="mt-4">Voyages et découvertes</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              FINX Club développe également des programmes de voyages touristiques, de rencontres professionnelles, de
              découverte et de cohésion. Chaque annonce précise la destination, les dates, le programme, les tarifs et
              les conditions de participation.
            </p>
            <div className="mt-6">
              <CtaButton variant="ghost" onClick={() => goPublic("contact")}>
                Découvrir les voyages
              </CtaButton>
            </div>
          </article>
        </div>
      </Section>
    </>
  );
}

export function PartenariatsPage() {
  return (
    <>
      <PageHero
        kicker="Partenariats"
        title="Construire des passerelles entre finance, formation et entreprise"
        lead="FINX Club entend développer des collaborations avec des établissements d’enseignement, des entreprises, des centres de formation et des organisations professionnelles."
        actions={
          <>
            <CtaButton onClick={() => goPublic("contact")}>Proposer un partenariat</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("ressources")}>
              Découvrir les initiatives
            </CtaButton>
          </>
        }
      />
      <Section>
        <div className="rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7 md:p-9 flex gap-4">
          <Handshake className="text-[#01AAE4] shrink-0" size={26} />
          <div>
            <h3>Collaborations ciblées</h3>
            <p className="mt-3 text-white/55 leading-relaxed max-w-3xl">
              Ces partenariats ont vocation à soutenir les programmes communs, les événements et l’accès à de nouvelles
              opportunités pour les membres. Ne sont publiés comme « partenaires » que les organisations avec lesquelles
              une collaboration est effectivement conclue.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

export function RessourcesPage() {
  return (
    <>
      <PageHero
        kicker="Ressources & actualités"
        title="S’informer pour mieux décider"
        lead="Retrouvez les informations institutionnelles du Club, les annonces d’événements, les actualités des programmes, les contenus pédagogiques accessibles au public et les comptes rendus des activités autorisés à la diffusion."
      />
      <Section>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, t: "Contenus pédagogiques", d: "Comprendre les marchés et les décisions d’investissement." },
            { icon: Sparkles, t: "Actualités du Club", d: "Annonces, événements et initiatives en cours." },
            { icon: Briefcase, t: "Documents publics", d: "Informations institutionnelles diffusables." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.t} className="rounded-2xl border border-white/10 bg-[#0E121C] p-6">
                <Icon className="text-[#01AAE4]" size={22} />
                <h3 className="mt-4">{item.t}</h3>
                <p className="mt-2 text-[14px] text-white/50">{item.d}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-[14px] text-white/45 max-w-3xl">
          Les prospectus, reportings individualisés et documents réservés restent accessibles selon les droits de
          chaque membre ou investisseur.
        </p>
      </Section>
    </>
  );
}

const FAQ_ITEMS = [
  {
    q: "Qu’est-ce que FINX Club ?",
    a: "FINX Club est un GIE qui réunit investissement, communauté académique et professionnelle, éducation financière et opportunités de développement.",
    category: "Le Club",
  },
  {
    q: "Faut-il investir pour devenir membre ?",
    a: "Non. L’adhésion au Club et l’investissement sont des démarches distinctes.",
    category: "Adhésion",
  },
  {
    q: "Quels programmes sont présentés ?",
    a: "FINX Bourse et FINX Transport. Les modalités et risques diffèrent selon les programmes.",
    category: "Investissement",
  },
  {
    q: "Comment obtenir le statut de membre actif ?",
    a: "Le premier niveau est accessible après deux participations éligibles. Les niveaux et avantages évoluent selon les règles du Club.",
    category: "Adhésion",
  },
  {
    q: "Comment devenir membre investisseur ?",
    a: "Le badge Membre Investisseur est attribué à toute personne ayant rejoint au moins un programme d’investissement du Club, selon les conditions applicables.",
    category: "Investissement",
  },
  {
    q: "Puis-je suivre mon investissement en ligne ?",
    a: "Oui, après validation du dossier et activation de l’accès, le tableau de bord sécurisé est conçu pour présenter les informations financières disponibles.",
    category: "Investissement",
  },
  {
    q: "Les rendements sont-ils garantis ?",
    a: "Non. Tout investissement comporte des risques, y compris la perte de tout ou partie du capital.",
    category: "Investissement",
  },
  {
    q: "Les événements sont-ils ouverts aux non-membres ?",
    a: "Les événements publics peuvent être ouverts aux visiteurs. Certains événements ou sessions sont réservés à des statuts déterminés.",
    category: "Événements",
  },
  {
    q: "Comment rejoindre le Club ?",
    a: "Vous pouvez créer un compte et transmettre une demande d’adhésion via le parcours prévu sur la plateforme.",
    category: "Adhésion",
  },
] as const;

const FAQ_CATEGORIES = ["Tout", "Le Club", "Adhésion", "Investissement", "Événements"] as const;

export function FaqPage() {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof FAQ_CATEGORIES)[number]>("Tout");
  const [openQuestion, setOpenQuestion] = useState<string | null>(FAQ_ITEMS[0].q);
  const visibleQuestions = FAQ_ITEMS.filter((item) => {
    const matchesCategory = category === "Tout" || item.category === category;
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    const matchesQuery =
      !normalizedQuery ||
      item.q.toLocaleLowerCase("fr").includes(normalizedQuery) ||
      item.a.toLocaleLowerCase("fr").includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className={isDark ? "bg-[#0C1426] text-[#F4F6FA]" : "bg-[#F7F9FC] text-[#17213B]"}>
      <section className={`relative isolate overflow-hidden border-b ${
        isDark ? "border-white/[0.07] bg-[#101A2D]" : "border-[#0B1B59]/[0.06] bg-white"
      }`}>
        <div className={`pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full blur-3xl ${
          isDark ? "bg-[#01AAE4]/[0.09]" : "bg-[#01AAE4]/[0.07]"
        }`} />
        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isDark ? "text-[#69D2F2]" : "text-[#087EA4]"
            }`}>
              Centre d’aide FINX Club
            </p>
            <h1 className={`mt-3 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.04em] ${
              isDark ? "text-white" : "text-[#0B1B59]"
            }`}>
              Des réponses pour avancer sereinement
            </h1>
            <p className={`mt-4 max-w-2xl text-[14px] leading-7 sm:text-[15px] ${
              isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
            }`}>
              Retrouvez les informations essentielles sur le Club, l’adhésion et les programmes d’investissement.
            </p>
          </motion.div>

          <label className="relative mt-8 block max-w-2xl">
            <Search size={18} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              isDark ? "text-[#91A0B8]" : "text-[#7B879A]"
            }`} />
            <span className="sr-only">Rechercher dans les questions fréquentes</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une question, un sujet…"
              className={`h-12 w-full rounded-xl border pl-11 pr-4 text-[13px] outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/20 ${
                isDark
                  ? "border-white/[0.1] bg-[#0C1426] text-white placeholder:text-white/40"
                  : "border-[#0B1B59]/[0.1] bg-[#FBFCFE] text-[#17213B] placeholder:text-[#8993A5]"
              }`}
            />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside>
            <p className={`mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] ${
              isDark ? "text-[#9EABC2]" : "text-[#78849A]"
            }`}>
              Parcourir par sujet
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {FAQ_CATEGORIES.map((item) => {
                const count = item === "Tout"
                  ? FAQ_ITEMS.length
                  : FAQ_ITEMS.filter((faq) => faq.category === item).length;
                const selected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item)}
                    className={`inline-flex shrink-0 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition-colors lg:w-full ${
                      selected
                        ? isDark
                          ? "bg-[#01AAE4]/[0.12] text-[#8DDEF5]"
                          : "bg-[#EAF7FC] text-[#075F7C]"
                        : isDark
                          ? "text-[#B9C4D8] hover:bg-white/[0.04] hover:text-white"
                          : "text-[#5A6780] hover:bg-[#0B1B59]/[0.04] hover:text-[#0B1B59]"
                    }`}
                  >
                    {item}
                    <span className={`text-[10px] ${selected
                      ? isDark ? "text-[#8DDEF5]/75" : "text-[#075F7C]/70"
                      : isDark ? "text-white/35" : "text-[#8993A5]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={`text-[15px] font-semibold ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
                Questions fréquentes
              </h2>
              <span className={`text-[11px] ${isDark ? "text-[#9EABC2]" : "text-[#7B879A]"}`}>
                {visibleQuestions.length} {visibleQuestions.length > 1 ? "réponses" : "réponse"}
              </span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {visibleQuestions.map((item) => {
                  const isOpen = openQuestion === item.q;
                  const questionIndex = FAQ_ITEMS.indexOf(item);
                  const questionId = `faq-question-${questionIndex}`;
                  const answerId = `faq-answer-${questionIndex}`;
                  return (
                    <motion.article
                      key={item.q}
                      layout
                      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
                      className={`overflow-hidden rounded-xl border transition-colors ${
                        isOpen
                          ? isDark
                            ? "border-[#01AAE4]/30 bg-[#141E34]"
                            : "border-[#01AAE4]/35 bg-white"
                          : isDark
                            ? "border-white/[0.08] bg-[#101A2D]"
                            : "border-[#0B1B59]/[0.08] bg-white"
                      }`}
                    >
                      <h3>
                        <button
                          id={questionId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={answerId}
                          onClick={() => setOpenQuestion(isOpen ? null : item.q)}
                          className={`flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 ${
                            isDark ? "text-white" : "text-[#0B1B59]"
                          }`}
                        >
                          <span className="text-[13px] font-semibold leading-5 sm:text-[14px]">{item.q}</span>
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isOpen
                              ? "bg-[#01AAE4]/[0.12] text-[#087EA4]"
                              : isDark ? "bg-white/[0.05] text-[#AEBBD0]" : "bg-[#0B1B59]/[0.04] text-[#65718A]"
                          }`}>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                          </span>
                        </button>
                      </h3>
                      <motion.div
                        id={answerId}
                        role={isOpen ? "region" : undefined}
                        aria-labelledby={questionId}
                        aria-hidden={!isOpen}
                        initial={false}
                        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className={`border-t px-4 pb-4 pt-3 text-[13px] leading-6 sm:px-5 ${
                          isDark ? "border-white/[0.07] text-[#B9C4D8]" : "border-[#0B1B59]/[0.07] text-[#5A6780]"
                        }`}>
                          {item.a}
                        </p>
                      </motion.div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>

              {visibleQuestions.length === 0 && (
                <div className={`rounded-xl border border-dashed px-5 py-10 text-center ${
                  isDark ? "border-white/15 text-[#B9C4D8]" : "border-[#0B1B59]/15 text-[#5A6780]"
                }`}>
                  <Search size={21} className="mx-auto mb-3 opacity-60" />
                  <p className="text-[13px] font-semibold">Aucun résultat trouvé</p>
                  <p className="mt-1 text-[12px]">Essayez un autre mot-clé ou choisissez un autre sujet.</p>
                </div>
              )}
            </div>

            <div className={`mt-8 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
              isDark ? "border-white/[0.08] bg-[#141E34]" : "border-[#0B1B59]/[0.07] bg-white"
            }`}>
              <div>
                <p className={`text-[14px] font-semibold ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
                  Vous ne trouvez pas votre réponse ?
                </p>
                <p className={`mt-1 text-[12px] leading-5 ${isDark ? "text-[#B9C4D8]" : "text-[#6A768C]"}`}>
                  Notre équipe peut vous orienter vers les bonnes informations.
                </p>
              </div>
              <CtaButton onClick={() => goPublic("contact")}>
                Nous contacter <ArrowRight size={15} className="ml-2" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Échangeons sur votre projet"
        lead="Vous souhaitez adhérer, découvrir les programmes, proposer un partenariat ou obtenir une information ? L’équipe FINX Club est à votre écoute."
        actions={
          <>
            <CtaButton onClick={() => (window.location.href = "mailto:admin@finxclub.com")}>Nous écrire</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("devenir-membre")}>
              Contacter le Club
            </CtaButton>
          </>
        }
      />
      <Section>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: MapPin, t: "Adresse", d: "Castor, Dakar, Sénégal" },
            { icon: Phone, t: "Téléphone", d: "+221 71 145 91 45" },
            { icon: Mail, t: "Courriel", d: "admin@finxclub.com" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.t} className="rounded-2xl border border-white/10 bg-[#0E121C] p-6">
                <Icon className="text-[#01AAE4]" size={20} />
                <p className="mt-4 text-[12px] uppercase tracking-[0.14em] text-white/40 font-bold">{item.t}</p>
                <p className="mt-2 font-semibold">{item.d}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
