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
  { page: "club", label: "Le Club" },
  { page: "investir", label: "Investir" },
  { page: "evenements", label: "Événements" },
  { page: "opportunites", label: "Opportunités" },
  { page: "partenariats", label: "Partenariats" },
  { page: "ressources", label: "Ressources" },
  { page: "faq", label: "FAQ" },
  { page: "contact", label: "Contact" },
];
