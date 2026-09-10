export type ProjectStatus = "em-producao" | "concluido";

export interface ProjectLinks {
  github: string;
  live: string;
}

export interface ProjectCaseStudy {
  context: string;
  solution: string;
  architecture?: string;
  challenges?: string[];
  decisions?: string[];
}

export interface ProjectData {
  slug: string;
  featured: boolean;
  name: string;
  summary: string;
  description: string;
  image: string;
  imageAlt: string;
  year?: number;
  role: string;
  status: ProjectStatus;
  links: ProjectLinks;
  technologies: string[];
  highlights: string[];
  results: string[];
  caseStudy?: ProjectCaseStudy;
}

export const projectsBase: ProjectData[] = [
  {
    slug: "taxsim",
    featured: true,
    name: "TaxSim",
    summary:
      "SaaS fiscal multi-tenant para simular e comparar os impactos da Reforma Tributária brasileira.",
    description:
      "O TaxSim integra a calculadora oficial da Receita Federal para comparar cenários tributários e transformar regras complexas em simulações compreensíveis para cada empresa.",
    image: "/images/taxsim-screenshot.png",
    imageAlt:
      "Painel do TaxSim com indicadores, gráfico de carga tributária e comparação de cenários.",
    year: 2026,
    role: "Desenvolvedor Full-Stack",
    status: "em-producao",
    links: {
      github: "https://github.com/M-its/taxsim",
      live: "https://taxsim-web.duckdns.org",
    },
    technologies: [
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
    highlights: [
      "Simulação e comparação de cenários da Reforma Tributária.",
      "Isolamento de dados por empresa em uma arquitetura multi-tenant.",
      "Integração com a calculadora oficial da Receita Federal.",
    ],
    results: [
      "Fluxo de simulação centralizado em uma interface orientada a decisão.",
      "Aplicação em produção com infraestrutura distribuída e custo operacional controlado.",
    ],
    caseStudy: {
      context:
        "A Reforma Tributária cria a necessidade de comparar regras atuais e futuras sem exigir que cada usuário domine todos os detalhes fiscais.",
      solution:
        "Uma plataforma que organiza dados da empresa, envia parâmetros para o cálculo e apresenta a diferença entre cenários de forma visual e auditável.",
      architecture:
        "Frontend em Next.js, API Fastify, persistência PostgreSQL com Prisma e serviços distribuídos em VMs separadas.",
      challenges: [
        "Traduzir entradas fiscais em parâmetros válidos para o motor de cálculo.",
        "Preservar isolamento multi-tenant durante autenticação e acesso aos dados.",
      ],
      decisions: [
        "Usar validação de contratos com Zod entre as camadas da aplicação.",
        "Priorizar testes automatizados para regras e integrações críticas.",
      ],
    },
  },
  {
    slug: "lens-app",
    featured: false,
    name: "Lens App",
    summary:
      "Aplicação full-stack que representa parte de um e-commerce de lentes para câmeras.",
    description:
      "O projeto explora uma experiência de catálogo e gestão de produtos para uma loja de lentes, conectando interface, API e banco de dados.",
    image: "/images/lens-app-screenshot.png",
    imageAlt: "Tela do Lens App exibindo uma listagem de lentes para câmeras.",
    role: "Desenvolvedor Full-Stack",
    status: "concluido",
    links: {
      github: "https://github.com/M-its/lens-app-front-end",
      live: "https://mits-lens-app.netlify.app/",
    },
    technologies: [
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
    highlights: [
      "Catálogo de produtos orientado a uma experiência de e-commerce.",
      "Integração entre frontend React, API Fastify e PostgreSQL.",
    ],
    results: [
      "Experiência full-stack com fluxo de dados entre interface e API.",
    ],
  },
  {
    slug: "food-explorer",
    featured: false,
    name: "Food Explorer",
    summary:
      "Aplicação de restaurante com frontend e backend, criada para simular uma experiência de pedido completa.",
    description:
      "O Food Explorer reúne catálogo, autenticação e gestão de itens em uma aplicação de ponta a ponta inspirada em um restaurante digital.",
    image: "/images/food-explorer-screenshot.png",
    imageAlt:
      "Tela inicial do Food Explorer com destaque para pratos do restaurante.",
    role: "Desenvolvedor Full-Stack",
    status: "concluido",
    links: {
      github: "https://github.com/M-its/food-explorer-web",
      live: "https://mits-food-explorer-web.netlify.app/",
    },
    technologies: [
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
    highlights: [
      "Fluxos de autenticação e perfis de acesso.",
      "Gestão de pratos e imagens no backend.",
    ],
    results: [
      "Aplicação ponta a ponta com dados persistidos e interface responsiva.",
    ],
  },
  {
    slug: "weather-app",
    featured: false,
    name: "Weather App",
    summary:
      "Aplicação de clima criada para praticar JavaScript, consumo de dados e interface responsiva.",
    description:
      "Um projeto compacto focado na apresentação de condições meteorológicas e na prática de fundamentos de frontend.",
    image: "/images/weather-app-screenshot.png",
    imageAlt: "Tela do Weather App com temperatura e condições do clima.",
    role: "Desenvolvedor Frontend",
    status: "concluido",
    links: {
      github: "https://github.com/M-its/weather-appJS",
      live: "https://wheather-app-mauve.vercel.app/",
    },
    technologies: ["JavaScript", "HTML", "CSS", "Custom Router", "Tailwind"],
    highlights: [
      "Interface de consulta de condições meteorológicas.",
      "Prática de JavaScript e composição de interface.",
    ],
    results: ["Projeto de estudo com foco em fundamentos de frontend."],
  },
];

export const featuredProject = projectsBase.find((project) => project.featured);

export function getProjectBySlug(slug: string) {
  return projectsBase.find((project) => project.slug === slug);
}
