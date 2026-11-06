import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
import { CtaButton, PublicShell, Section } from "./PublicShell";
import { goPublic, readPublicPage, type PublicPage } from "./publicNav";
import {
  ClubPage,
  ContactPage,
  DevenirMembrePage,
  EvenementsPage,
  FaqPage,
  InvestirPage,
  OpportunitesPage,
  ParcoursInvestisseurPage,
  PartenariatsPage,
  RessourcesPage,
} from "./VitrinePages";

const DIMENSIONS = [
  {
    icon: LineChart,
    title: "Investissement",
    text: "Découvrez des programmes structurés et accédez à une information claire sur leurs modalités, leurs perspectives et leurs risques.",
  },
  {
    icon: Users,
    title: "Communauté",
    text: "Rencontrez des profils engagés, échangez des expériences et développez des relations durables.",
  },
  {
    icon: BookOpen,
    title: "Éducation financière",
    text: "Participez à des conférences, masterclass et webinaires pour approfondir votre compréhension des marchés et des décisions d’investissement.",
  },
  {
    icon: GraduationCap,
    title: "Opportunités",
    text: "Explorez des initiatives académiques et professionnelles : mentorat, stages, bourses, visites d’entreprises et programmes de voyage, selon les offres disponibles.",
  },
];

function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden min-h-[88vh] flex items-end">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 70% 20%, rgba(1,170,228,0.22), transparent 50%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(1,170,228,0.12), transparent 45%), linear-gradient(165deg, #0B1B59 0%, #070F2A 42%, #05070F 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative w-full max-w-6xl mx-auto px-5 pt-16 pb-12 md:pt-20 md:pb-16">
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold text-[#01AAE4] mb-3">FINX Club</p>
          <h1 className="max-w-3xl">
            Où l’ambition
            <br />
            rencontre l’opportunité
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] md:text-[16px] text-white/65 leading-relaxed">
            Investir, apprendre et progresser au sein d’une communauté qui réunit investisseurs, étudiants,
            professionnels et entrepreneurs autour d’une même ambition : construire ensemble de nouvelles perspectives
            financières et professionnelles.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaButton onClick={() => goPublic("club")}>Découvrir le Club</CtaButton>
            <CtaButton variant="ghost" onClick={() => goPublic("devenir-membre")}>
              Devenir membre
            </CtaButton>
            <CtaButton variant="cyan" onClick={() => goPublic("investir")}>
              Explorer nos programmes
            </CtaButton>
          </div>
        </div>
      </section>

      <Section>
        <p className="text-[12px] uppercase tracking-[0.18em] font-bold text-[#01AAE4]">Un club, quatre dimensions</p>
        <h2 className="mt-3 max-w-2xl">Investissement, communauté, éducation et opportunités</h2>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          {DIMENSIONS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[1.4rem] border border-white/10 bg-[#0E121C] p-6 md:p-7">
                <Icon className="text-[#01AAE4]" size={24} />
                <h3 className="mt-4">{item.title}</h3>
                <p className="mt-3 text-[14px] text-white/55 leading-relaxed">{item.text}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <section className="max-w-6xl mx-auto px-5 pb-4">
        <div className="rounded-[1.8rem] border border-white/10 bg-gradient-to-r from-[#0B1B59] via-[#122866] to-[#0E121C] p-8 md:p-12">
          <Sparkles className="text-[#01AAE4]" size={26} />
          <h2 className="mt-5 max-w-2xl">Un engagement fondé sur la discipline</h2>
          <p className="mt-4 max-w-2xl text-white/65 leading-relaxed">
            FINX Club place la transparence, la rigueur, la progression et l’intelligence collective au cœur de son
            fonctionnement. Chaque membre peut évoluer dans la communauté et accéder à des avantages selon son statut et
            les conditions du Club.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid lg:grid-cols-2 gap-5">
          <article className="rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7">
            <Briefcase className="text-[#01AAE4]" size={24} />
            <h3 className="mt-4 text-xl">Programmes d’investissement</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              FINX Bourse et FINX Transport : des univers distincts, avec leurs modalités, risques et documents
              d’information.
            </p>
            <div className="mt-6">
              <CtaButton variant="ghost" onClick={() => goPublic("investir")}>
                Découvrir les programmes
              </CtaButton>
            </div>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-[#0E121C] p-7">
            <Users className="text-[#01AAE4]" size={24} />
            <h3 className="mt-4 text-xl">L’Instant Invest & la vie du Club</h3>
            <p className="mt-3 text-white/55 leading-relaxed">
              Conférences, masterclass, webinaires et activités de cohésion pour comprendre, échanger et progresser.
            </p>
            <div className="mt-6">
              <CtaButton variant="ghost" onClick={() => goPublic("evenements")}>
                Voir les événements
              </CtaButton>
            </div>
          </article>
        </div>
      </Section>

      <section className="max-w-6xl mx-auto px-5 pb-16">
        <div className="rounded-[2rem] overflow-hidden relative px-8 py-12 md:px-12 md:py-14 bg-[#0B1B59] text-white">
          <p className="text-[12px] uppercase tracking-[0.18em] font-bold text-[#01AAE4]">Rejoindre</p>
          <h2 className="mt-3 max-w-xl text-white">
            Votre prochaine opportunité commence peut-être par une rencontre
          </h2>
          <p className="mt-4 max-w-xl text-white/75">Rejoindre FINX Club.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => goPublic("devenir-membre")}
              className="h-12 px-6 rounded-full bg-[#01AAE4] text-white text-sm font-bold"
            >
              Devenir membre
            </button>
            <button
              type="button"
              onClick={() => goPublic("contact")}
              className="h-12 px-6 rounded-full border border-white/35 text-white text-sm font-bold"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function ShowcaseRouter({ page }: { page: PublicPage }) {
  switch (page) {
    case "club":
      return <ClubPage />;
    case "devenir-membre":
      return <DevenirMembrePage />;
    case "investir":
      return <InvestirPage />;
    case "parcours-investisseur":
      return <ParcoursInvestisseurPage />;
    case "evenements":
      return <EvenementsPage />;
    case "opportunites":
      return <OpportunitesPage />;
    case "partenariats":
      return <PartenariatsPage />;
    case "ressources":
      return <RessourcesPage />;
    case "faq":
      return <FaqPage />;
    case "contact":
      return <ContactPage />;
    default:
      return <HomePage />;
  }
}

export function PublicSite() {
  const [page, setPage] = useState<PublicPage>(() =>
    typeof window !== "undefined" ? readPublicPage() : "home",
  );

  useEffect(() => {
    const sync = () => {
      const next = readPublicPage();
      if (next === "login" || next === "register") return;
      setPage(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", sync);
    sync();
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const showcasePage: PublicPage =
    page === "login" || page === "register" ? "home" : page;

  return (
    <PublicShell active={showcasePage}>
      <ShowcaseRouter page={showcasePage} />
    </PublicShell>
  );
}
