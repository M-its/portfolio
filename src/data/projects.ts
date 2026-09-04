export interface ProjectData {
  repository: string;
  name: string;
  description: string;
  image: string;
  github_repo: string;
  homepage: string;
  languages: string[];
}

export const projectsBase: ProjectData[] = [
  {
    repository: "taxsim",
    name: "TaxSim",
    description:
      "SaaS fiscal multi-tenant para simular e comparar os impactos da Reforma Tributária brasileira, integrado à calculadora oficial da Receita Federal.",
    image: "/images/taxsim-screenshot.png",
    github_repo: "https://github.com/M-its/taxsim",
    homepage: "https://taxsim-web.duckdns.org",
    languages: [
      "Next.js",
      "TypeScript",
      "Fastify",
      "Prisma",
      "PostgreSQL",
      "Zod",
      "Docker",
      "Caddy",
      "Vitest",
    ],
  },
  {
    repository: "lens-app-front-end",
    name: "Lens App",
    description:
      "Uma aplicação full-stack que representa parte de um e-commerce de lentes para cameras.",
    image: "/images/lens-app-screenshot.png",
    github_repo: "https://github.com/M-its/lens-app-front-end",
    homepage: "https://mits-lens-app.netlify.app/",
    languages: [
      "ReactJS",
      "NodeJS",
      "Fastify",
      "Tailwind",
      "React-router",
      "Zod",
      "PM2",
      "Knex",
      "PostgreSQL",
    ],
  },
  {
    repository: "food-explorer-web",
    name: "Food Explorer",
    description:
      "Uma aplicação de ponta a ponta com front-end e back-end, utilizando as tecnologias aprendidas no Explorer, simulando um restaurante.",
    image: "/images/food-explorer-screenshot.png",
    github_repo: "https://github.com/M-its/food-explorer-web",
    homepage: "https://mits-food-explorer-web.netlify.app/",
    languages: [
      "NodeJS",
      "ReactJS",
      "JavaScript",
      "Express",
      "Knex",
      "SQLite",
      "Multer",
      "styled-components",
      "JSON Web Token",
      "Swiper",
    ],
  },
  {
    repository: "weather-appJS",
    name: "Weather App",
    description:
      "Simple weather app inspired by florinpop17 app-ideas repository to pratice coding.",
    image: "/images/weather-app-screenshot.png",
    github_repo: "https://github.com/M-its/weather-appJS",
    homepage: "https://wheather-app-mauve.vercel.app/",
    languages: ["JavaScript", "HTML", "CSS", "Custom Router", "Tailwind"],
  },
];
