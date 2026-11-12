export type PublicPage =
  | "home"
  | "club"
  | "devenir-membre"
  | "investir"
  | "parcours-investisseur"
  | "evenements"
  | "opportunites"
  | "partenariats"
  | "ressources"
  | "galerie"
  | "faq"
  | "contact"
  | "login"
  | "register";

const HASH_TO_PAGE: Record<string, PublicPage> = {
  "": "home",
  "/": "home",
  accueil: "home",
  club: "club",
  "le-club": "club",
  "devenir-membre": "devenir-membre",
  adhesion: "devenir-membre",
  investir: "investir",
  programmes: "investir",
  "parcours-investisseur": "parcours-investisseur",
  evenements: "evenements",
  "instant-invest": "evenements",
  opportunites: "opportunites",
  partenariats: "partenariats",
  ressources: "ressources",
  actualites: "ressources",
  galerie: "galerie",
  faq: "faq",
  contact: "contact",
  connexion: "login",
  login: "login",
  inscription: "register",
  register: "register",
};

const PAGE_TO_HASH: Record<PublicPage, string> = {
  home: "/",
  club: "/club",
  "devenir-membre": "/devenir-membre",
  investir: "/investir",
  "parcours-investisseur": "/parcours-investisseur",
  evenements: "/evenements",
  opportunites: "/opportunites",
  partenariats: "/partenariats",
  ressources: "/ressources",
  galerie: "/galerie",
  faq: "/faq",
  contact: "/contact",
  login: "/connexion",
  register: "/inscription",
};

export function readPublicPage(): PublicPage {
  const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
  return HASH_TO_PAGE[hash] ?? HASH_TO_PAGE[hash.split("/")[0]] ?? "home";
}

export function goPublic(page: PublicPage) {
  window.location.hash = PAGE_TO_HASH[page];
}

export const MAIN_NAV: { page: PublicPage; label: string }[] = [
  { page: "club", label: "Club" },
  { page: "investir", label: "Investir" },
  { page: "partenariats", label: "Partenariat" },
];

export const DISCOVER_NAV: { page: PublicPage; label: string; description: string }[] = [
  { page: "evenements", label: "Événements", description: "Rencontres, ateliers et temps forts" },
  { page: "opportunites", label: "Opportunités", description: "Projets et parcours à explorer" },
  { page: "ressources", label: "Ressources", description: "Guides, actualités et contenus" },
];

export const LANGUAGE_OPTIONS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
] as const;

export type PublicLanguage = (typeof LANGUAGE_OPTIONS)[number]["code"];
