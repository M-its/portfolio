import { getProjectBySlug } from "./projects";

export const SITE_URL = "https://mitsrael.vercel.app";
export const INDEXABLE_ROBOTS = "index, follow, max-image-preview:large";

export interface PageMetadataData {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  robots: string;
}

export function getPageMetadata(pathname: string): PageMetadataData {
  const path = pathname.replace(/\/+$/, "") || "/";
  const home: PageMetadataData = {
    title: "Mitsrael Souza | Desenvolvedor Full-Stack React & Node.js",
    description:
      "Portfólio de Mitsrael Souza — Desenvolvedor Full-Stack especialista em React, TypeScript e Node.js. Criando interfaces de alta performance e arquiteturas robustas.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    imageAlt: "Mitsrael Souza — Desenvolvedor Full-Stack",
    robots: INDEXABLE_ROBOTS,
  };
  if (path === "/") return home;
  const projectMatch = /^\/projects\/([^/]+)$/.exec(path);
  const project = projectMatch ? getProjectBySlug(projectMatch[1]) : undefined;
  if (project) {
    return {
      ...home,
      title: `${project.name} | Estudo de caso — Mitsrael Souza`,
      description: project.description,
      url: `${SITE_URL}/projects/${project.slug}`,
    };
  }
  return {
    ...home,
    title:
      path === "/components"
        ? "Componentes | Mitsrael Souza"
        : "Página não encontrada | Mitsrael Souza",
    url: `${SITE_URL}${path}`,
    robots: "noindex, follow",
  };
}
