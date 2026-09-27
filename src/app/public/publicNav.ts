export type PublicPage = "home" | "login" | "register";

export function readPublicPage(): PublicPage {
  const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (hash === "connexion" || hash === "login") return "login";
  if (hash === "inscription" || hash === "register") return "register";
  return "home";
}

export function goPublic(page: PublicPage) {
  window.location.hash = page === "home" ? "/" : page === "login" ? "/connexion" : "/inscription";
}
