import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Eye,
  Mail,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { CtaButton, PublicShell, Section } from "./PublicShell";
import { useTheme } from "../theme/ThemeContext";
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
    title: "Investissement",
    text: "Découvrez des programmes structurés et accédez à une information claire sur leurs modalités, leurs perspectives et leurs risques.",
    page: "investir",
    image: "/resources/images/investissement.png",
    imageAlt: "Visualisation de graphiques et de données financières",
  },
  {
    title: "Communauté",
    text: "Rencontrez des profils engagés, échangez des expériences et développez des relations durables.",
    page: "club",
    image: "/resources/images/people.png",
    imageAlt: "Des membres échangent autour de données financières",
  },
  {
    title: "Éducation financière",
    text: "Participez à des conférences, masterclass et webinaires pour approfondir votre compréhension des marchés et des décisions d’investissement.",
    page: "evenements",
    image: "/resources/images/educationFinanciere.png",
    imageAlt: "Documents et outils utilisés pour apprendre la gestion financière",
  },
  {
    title: "Opportunités",
    text: "Explorez des initiatives académiques et professionnelles : mentorat, stages, bourses, visites d’entreprises et programmes de voyage, selon les offres disponibles.",
    page: "opportunites",
    image: "/resources/images/opportunite.png",
    imageAlt: "Poignée de main symbolisant une nouvelle opportunité professionnelle",
  },
] as const;

const CLUB_PRINCIPLES = [
  {
    number: "01",
    icon: Eye,
    title: "Transparence",
    text: "Des informations claires pour comprendre les programmes, leurs modalités et leurs risques.",
  },
  {
    number: "02",
    icon: Scale,
    title: "Rigueur",
    text: "Une approche réfléchie, guidée par la discipline et la responsabilité.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Progression",
    text: "Des occasions d’apprendre, de développer ses compétences et de faire avancer ses projets.",
  },
  {
    number: "04",
    icon: Users,
    title: "Intelligence collective",
    text: "Une communauté qui valorise le partage d’expériences et la coopération.",
  },
] as const;

function HomePage() {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section className="finx-home-hero">
        <div className="relative isolate flex min-h-[650px] items-end overflow-hidden bg-[#080D18] shadow-[0_28px_80px_-36px_rgba(5,12,30,0.48)] sm:min-h-[620px] lg:min-h-[600px] lg:items-center">
          <motion.img
            src="/bannierSectionUne.png"
            alt="Professionnel souriant, représentant l’ambition et les opportunités offertes par FINX Club"
            initial={reduceMotion ? false : { opacity: 0.75, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: reduceMotion ? 0 : 1.2, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover object-[68%_15%] md:object-[center_15%]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/75 to-[#05070F]/10 md:bg-gradient-to-r md:from-[#05070F]/95 md:via-[#05070F]/75 md:to-[#05070F]/10"
          />
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
            className="relative w-full max-w-[760px] px-6 pb-9 pt-32 sm:px-10 sm:pb-12 sm:pt-36 lg:px-14 lg:py-16"
          >
            <p className="mb-4 inline-flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7DDBF6] sm:text-[11px]">
              FINX Club
            </p>
            <h1 className="max-w-[660px] text-[clamp(2.15rem,5vw,4.65rem)] font-bold leading-[1.02] tracking-[-0.05em] text-white">
              Où l’ambition
              <br />
              rencontre
              <br />
              l’opportunité
            </h1>
            <p className="mt-5 max-w-[610px] text-[13px] leading-6 text-white/80 sm:mt-6 sm:text-[14px] sm:leading-7">
              Investir, apprendre et progresser au sein d’une communauté qui réunit investisseurs, étudiants,
              professionnels et entrepreneurs autour d’une même ambition : construire ensemble de nouvelles perspectives
              financières et professionnelles.
            </p>
            <div className="finx-hero-actions mt-6 flex flex-wrap gap-2.5">
              <CtaButton onClick={() => goPublic("club")}>Découvrir le Club</CtaButton>
              <CtaButton variant="ghost" onClick={() => goPublic("investir")}>
                Explorer nos programmes
              </CtaButton>
            </div>
            <button
              type="button"
              onClick={() => goPublic("devenir-membre")}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01AAE4] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070F]"
            >
              Vous souhaitez rejoindre le Club ?
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      <section
        className={`overflow-hidden ${
          isDark ? "bg-[#0C1426] text-[#F4F6FA]" : "bg-white text-[#17213B]"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className={`mt-1 text-[clamp(1.75rem,3.2vw,2.65rem)] font-bold leading-tight tracking-[-0.035em] ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
              Investir, apprendre et avancer ensemble
            </h2>
            <p className={`mx-auto mt-4 max-w-2xl text-[14px] leading-7 sm:text-[15px] ${isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"}`}>
              Des rencontres aux projets, découvrez les leviers qui vous aident à progresser.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
            {DIMENSIONS.map((item, index) => {
              return (
                <motion.article
                  key={item.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 42 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.8,
                    delay: reduceMotion ? 0 : index * 0.14,
                    ease: "easeOut",
                  }}
                  className={`group flex min-h-[380px] flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 ${
                    isDark
                      ? "border-white/[0.09] bg-[#141E34] shadow-[0_12px_30px_-24px_rgba(0,0,0,0.8)] hover:border-[#01AAE4]/40 hover:shadow-[0_20px_40px_-24px_rgba(0,170,228,0.24)]"
                      : "border-[#0B1B59]/[0.09] bg-[#FBFCFE] shadow-[0_12px_32px_-26px_rgba(11,27,89,0.28)] hover:border-[#01AAE4]/40 hover:bg-white hover:shadow-[0_20px_40px_-24px_rgba(11,27,89,0.22)]"
                  }`}
                >
                  <div className="h-44 w-full shrink-0 overflow-hidden sm:h-40 lg:h-36">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className={`text-[16px] font-semibold tracking-[-0.015em] ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
                      {item.title}
                    </h3>
                    <p className={`mt-2 flex-1 text-[13px] leading-6 ${isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"}`}>
                      {item.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => goPublic(item.page)}
                      className={`mt-5 inline-flex w-fit cursor-pointer items-center gap-2 text-[12px] font-semibold transition-colors ${
                        isDark
                          ? "text-[#69D2F2] hover:text-white"
                          : "text-[#087EA4] hover:text-[#0B1B59]"
                      }`}
                    >
                      En savoir plus
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={isDark ? "bg-[#101A2D] text-[#F4F6FA]" : "bg-[#F4F7FB] text-[#17213B]"}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isDark ? "text-[#69D2F2]" : "text-[#087EA4]"
            }`}>
              Notre engagement
            </p>
            <h2 className={`mt-3 max-w-lg text-[clamp(1.8rem,3vw,2.7rem)] font-bold leading-[1.12] tracking-[-0.035em] ${
              isDark ? "text-white" : "text-[#0B1B59]"
            }`}>
              Grandir ensemble, avec exigence et confiance
            </h2>
            <p className={`mt-5 max-w-lg text-[14px] leading-7 sm:text-[15px] ${
              isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
            }`}>
              FINX Club place la transparence, la rigueur et le partage au cœur de son fonctionnement. Des principes
              qui accompagnent chaque membre dans son parcours et ses projets.
            </p>
            <button
              type="button"
              onClick={() => goPublic("club")}
              className={`group mt-7 inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold transition-colors ${
                isDark ? "text-[#69D2F2] hover:text-white" : "text-[#087EA4] hover:text-[#0B1B59]"
              }`}
            >
              En savoir plus sur le Club
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {CLUB_PRINCIPLES.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.article
                  key={principle.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.7,
                    delay: reduceMotion ? 0 : index * 0.1,
                    ease: "easeOut",
                  }}
                  className={`rounded-2xl border p-5 sm:min-h-[190px] sm:p-6 ${
                    isDark
                      ? "border-white/[0.08] bg-[#17243B] shadow-[0_12px_30px_-24px_rgba(0,0,0,0.75)]"
                      : "border-[#0B1B59]/[0.08] bg-white shadow-[0_12px_30px_-26px_rgba(11,27,89,0.26)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold tracking-[0.12em] ${
                      isDark ? "text-white/35" : "text-[#0B1B59]/35"
                    }`}>
                      {principle.number}
                    </span>
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className={isDark ? "text-[#69D2F2]" : "text-[#087EA4]"}
                    />
                  </div>
                  <h3 className={`mt-5 text-[15px] font-semibold tracking-[-0.01em] ${
                    isDark ? "text-white" : "text-[#0B1B59]"
                  }`}>
                    {principle.title}
                  </h3>
                  <p className={`mt-2 text-[13px] leading-6 ${
                    isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
                  }`}>
                    {principle.text}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={isDark ? "bg-[#0C1426] text-[#F4F6FA]" : "bg-white text-[#17213B]"}>
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
            className="mx-auto mb-9 max-w-3xl text-center sm:mb-12"
          >
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#69D2F2]" : "text-[#087EA4]"}`}>
              Explorer FINX Club
            </p>
            <h2 className={`mt-3 text-[clamp(1.75rem,3vw,2.55rem)] font-bold leading-tight tracking-[-0.035em] ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
              Des parcours pour passer à l’action
            </h2>
            <p className={`mx-auto mt-3 max-w-xl text-[14px] leading-7 sm:text-[15px] ${isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"}`}>
              Approfondissez vos projets et faites vivre votre engagement au sein du Club.
            </p>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
            {[
              {
                number: "01",
                eyebrow: "Construire son parcours",
                title: "Les programmes d’investissement",
                text: "Explorez FINX Bourse et FINX Transport, deux univers distincts. Consultez leurs modalités, les risques associés et les documents d’information avant toute décision.",
                link: "Découvrir les programmes",
                page: "investir" as const,
                icon: Briefcase,
              },
              {
                number: "02",
                eyebrow: "Apprendre et se rencontrer",
                title: "L’Instant Invest & la vie du Club",
                text: "Conférences, masterclass, webinaires et activités de cohésion : des rendez-vous pour partager des expériences et progresser ensemble.",
                link: "Explorer les événements",
                page: "evenements" as const,
                icon: Users,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.8,
                    delay: reduceMotion ? 0 : index * 0.14,
                    ease: "easeOut",
                  }}
                  className={`group relative flex min-h-[290px] flex-col overflow-hidden rounded-[1.5rem] border p-6 sm:p-8 lg:min-h-[320px] ${
                    isDark
                      ? "border-white/[0.08] bg-[#141E34] hover:border-[#01AAE4]/35"
                      : "border-[#0B1B59]/[0.08] bg-[#F8FAFD] hover:border-[#01AAE4]/40"
                  } transition-colors duration-300`}
                >
                  <span className={`pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${
                    isDark ? "bg-[#01AAE4]/[0.08] opacity-60" : "bg-[#01AAE4]/[0.07] opacity-40"
                  }`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isDark ? "bg-[#01AAE4]/[0.12] text-[#69D2F2]" : "bg-[#01AAE4]/[0.1] text-[#087EA4]"
                    }`}>
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                    <span className={`pt-1 text-[11px] font-semibold tracking-[0.14em] ${
                      isDark ? "text-white/35" : "text-[#0B1B59]/35"
                    }`}>
                      {item.number}
                    </span>
                  </div>
                  <div className="relative mt-6">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      isDark ? "text-[#69D2F2]" : "text-[#087EA4]"
                    }`}>
                      {item.eyebrow}
                    </p>
                    <h3 className={`mt-2 text-[19px] font-semibold leading-snug tracking-[-0.02em] sm:text-[21px] ${
                      isDark ? "text-white" : "text-[#0B1B59]"
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`mt-3 max-w-xl text-[13px] leading-6 sm:text-[14px] ${
                      isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
                    }`}>
                      {item.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goPublic(item.page)}
                    className={`relative mt-auto inline-flex w-fit cursor-pointer items-center gap-2 pt-6 text-[13px] font-semibold ${
                      isDark ? "text-[#69D2F2] hover:text-white" : "text-[#087EA4] hover:text-[#0B1B59]"
                    } transition-colors`}
                  >
                    {item.link}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={isDark ? "bg-[#101A2D] text-[#F4F6FA]" : "bg-[#F4F7FB] text-[#17213B]"}>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14 lg:py-16">
          <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#69D2F2]" : "text-[#087EA4]"}`}>
                Parlons de vos projets
              </p>
              <h2 className={`mt-3 max-w-lg text-[clamp(1.8rem,3vw,2.7rem)] font-bold leading-[1.12] tracking-[-0.035em] ${
                isDark ? "text-white" : "text-[#0B1B59]"
              }`}>
                Votre prochaine opportunité commence par un échange
              </h2>
              <p className={`mt-5 max-w-lg text-[14px] leading-7 sm:text-[15px] ${
                isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"
              }`}>
                Une question sur le Club ou ses programmes ? Laissez-nous votre adresse et le motif de votre demande.
                Notre équipe sera ravie d’en discuter avec vous.
              </p>
              <button
                type="button"
                onClick={() => goPublic("devenir-membre")}
                className={`mt-7 inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold transition-colors ${
                  isDark ? "text-[#69D2F2] hover:text-white" : "text-[#087EA4] hover:text-[#0B1B59]"
                }`}
              >
                Découvrir l’adhésion
                <ArrowRight size={15} />
              </button>
            </motion.div>

            <motion.form
              initial={reduceMotion ? false : { opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
              onSubmit={(event) => event.preventDefault()}
              className={`rounded-2xl border p-5 shadow-[0_24px_60px_-40px_rgba(11,27,89,0.38)] sm:p-6 ${
                isDark ? "border-white/[0.09] bg-[#17243B]" : "border-[#0B1B59]/[0.08] bg-white"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isDark ? "bg-[#01AAE4]/[0.14] text-[#69D2F2]" : "bg-[#01AAE4]/[0.1] text-[#087EA4]"
                }`}>
                  <Mail size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className={`text-[15px] font-semibold ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
                    Écrivez-nous
                  </h3>
                  <p className={`mt-0.5 text-[12px] ${isDark ? "text-[#B9C4D8]" : "text-[#6A768C]"}`}>
                    Les champs marqués d’un * sont requis.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={`mb-1.5 block text-[12px] font-medium ${isDark ? "text-[#D2DAE8]" : "text-[#35425C]"}`}>
                    Adresse e-mail <span className="text-[#087EA4]">*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    className={`h-11 w-full rounded-lg border px-3.5 text-[13px] outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/20 ${
                      isDark
                        ? "border-white/10 bg-[#0C1426] text-white placeholder:text-white/35"
                        : "border-[#0B1B59]/[0.12] bg-[#FBFCFE] text-[#17213B] placeholder:text-[#8993A5]"
                    }`}
                  />
                </label>

                <label className="block">
                  <span className={`mb-1.5 block text-[12px] font-medium ${isDark ? "text-[#D2DAE8]" : "text-[#35425C]"}`}>
                    Motif de votre demande <span className="text-[#087EA4]">*</span>
                  </span>
                  <input
                    type="text"
                    name="motif"
                    required
                    placeholder="Ex. Demande d’information sur le Club"
                    className={`h-11 w-full rounded-lg border px-3.5 text-[13px] outline-none transition focus:border-[#01AAE4] focus:ring-2 focus:ring-[#01AAE4]/20 ${
                      isDark
                        ? "border-white/10 bg-[#0C1426] text-white placeholder:text-white/35"
                        : "border-[#0B1B59]/[0.12] bg-[#FBFCFE] text-[#17213B] placeholder:text-[#8993A5]"
                    }`}
                  />
                </label>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#0B1B59] px-5 text-[13px] font-semibold text-white opacity-80"
                disabled
              >
                Envoyer ma demande
                <ArrowRight size={15} />
              </button>
            </motion.form>
        </div>
      </section>
    </>
  );
}

function GalleryPage() {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();
  const galleryImages = [
    { src: "/bannierSectionUne.png", alt: "Portrait d’un professionnel, symbole d’ambition et de réussite" },
    { src: "/resources/images/people.png", alt: "Échange entre professionnels autour de la finance" },
    { src: "/resources/images/investissement.png", alt: "Graphiques et données sur les marchés financiers" },
    { src: "/resources/images/educationFinanciere.png", alt: "Atelier de travail autour de documents financiers" },
    { src: "/resources/images/opportunite.png", alt: "Poignée de main entre deux partenaires professionnels" },
  ];

  return (
    <section className={isDark ? "bg-[#0C1426] text-[#F4F6FA]" : "bg-[#F7F9FC] text-[#17213B]"}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className="mb-9 max-w-2xl sm:mb-12"
        >
          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${isDark ? "text-[#69D2F2]" : "text-[#087EA4]"}`}>
            Galerie FINX Club
          </p>
          <h1 className={`mt-3 text-[clamp(2rem,3.8vw,3rem)] font-bold leading-tight tracking-[-0.035em] ${isDark ? "text-white" : "text-[#0B1B59]"}`}>
            L’ambition prend vie ensemble
          </h1>
          <p className={`mt-4 max-w-xl text-[14px] leading-7 sm:text-[15px] ${isDark ? "text-[#B9C4D8]" : "text-[#5A6780]"}`}>
            Quelques images pour illustrer les rencontres, les idées et les opportunités au cœur de FINX Club.
          </p>
        </motion.div>

        <div className="grid auto-rows-[180px] gap-3 sm:auto-rows-[220px] sm:grid-cols-2 sm:gap-4 lg:auto-rows-[250px] lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <motion.figure
              key={image.src}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: reduceMotion ? 0 : 0.65,
                delay: reduceMotion ? 0 : index * 0.08,
                ease: "easeOut",
              }}
              className={`group overflow-hidden rounded-2xl border ${
                index === 0 ? "sm:row-span-2" : ""
              } ${isDark ? "border-white/10 bg-[#141E34]" : "border-[#0B1B59]/10 bg-white"}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
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
    case "galerie":
      return <GalleryPage />;
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
