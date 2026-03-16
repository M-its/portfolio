import React from "react";
import SpinnerIcon from "../assets/icons/spinner.svg?react";

type SvgComponent = React.FC<React.ComponentProps<"svg">>;
type LazyIcon = React.LazyExoticComponent<SvgComponent>;

function lazyIcon(
  importFn: () => Promise<{ default: SvgComponent }>,
): LazyIcon {
  return React.lazy(importFn);
}

export const techs = [
  {
    name: "Node",
    icon: lazyIcon(() => import("../assets/icons/nodedotjs.svg?react")),
  },
  {
    name: "JavaScript",
    icon: lazyIcon(() => import("../assets/icons/javascript.svg?react")),
  },
  {
    name: "React",
    icon: lazyIcon(() => import("../assets/icons/react.svg?react")),
  },
  {
    name: "HTML",
    icon: lazyIcon(() => import("../assets/icons/html5.svg?react")),
  },
  {
    name: "CSS",
    icon: lazyIcon(() => import("../assets/icons/css3.svg?react")),
  },
  {
    name: "Vite",
    icon: lazyIcon(() => import("../assets/icons/vite.svg?react")),
  },
  {
    name: "GitHub",
    icon: lazyIcon(() => import("../assets/icons/github-techs.svg?react")),
  },
  {
    name: "Jest",
    icon: lazyIcon(() => import("../assets/icons/jest.svg?react")),
  },
  {
    name: "SQL",
    icon: lazyIcon(() => import("../assets/icons/sql.svg?react")),
  },
  {
    name: "Postgre SQL",
    icon: lazyIcon(() => import("../assets/icons/postgresql.svg?react")),
  },
  {
    name: "TypeScript",
    icon: lazyIcon(() => import("../assets/icons/typescript.svg?react")),
  },
  {
    name: "Tailwind",
    icon: lazyIcon(() => import("../assets/icons/tailwindcss.svg?react")),
  },
  {
    name: "Zod",
    icon: lazyIcon(() => import("../assets/icons/zod.svg?react")),
  },
  {
    name: "Git",
    icon: lazyIcon(() => import("../assets/icons/git.svg?react")),
  },
  {
    name: "Next",
    icon: lazyIcon(() => import("../assets/icons/nextdotjs.svg?react")),
  },
  {
    name: "Axios",
    icon: lazyIcon(() => import("../assets/icons/axios.svg?react")),
  },
  {
    name: "Dotenv",
    icon: lazyIcon(() => import("../assets/icons/dotenv.svg?react")),
  },
  {
    name: "Express",
    icon: lazyIcon(() => import("../assets/icons/express.svg?react")),
  },
  {
    name: "FastAPI",
    icon: lazyIcon(() => import("../assets/icons/fastapi.svg?react")),
  },
  {
    name: "Fastify",
    icon: lazyIcon(() => import("../assets/icons/fastify.svg?react")),
  },
  {
    name: "JWT",
    icon: lazyIcon(() => import("../assets/icons/jwt.svg?react")),
  },
  {
    name: "Knex",
    icon: lazyIcon(() => import("../assets/icons/knexdotjs.svg?react")),
  },
  {
    name: "React Router",
    icon: lazyIcon(() => import("../assets/icons/reactrouter.svg?react")),
  },
  {
    name: "Sass",
    icon: lazyIcon(() => import("../assets/icons/sass.svg?react")),
  },
  {
    name: "SQLite",
    icon: lazyIcon(() => import("../assets/icons/sqlite.svg?react")),
  },
  {
    name: "Styled Components",
    icon: lazyIcon(() => import("../assets/icons/styledcomponents.svg?react")),
  },
  {
    name: "Swagger",
    icon: lazyIcon(() => import("../assets/icons/swagger.svg?react")),
  },
  {
    name: "Swiper",
    icon: lazyIcon(() => import("../assets/icons/swiper.svg?react")),
  },
  {
    name: "Vitest",
    icon: lazyIcon(() => import("../assets/icons/vitest.svg?react")),
  },
  {
    name: "Docker",
    icon: lazyIcon(() => import("../assets/icons/docker.svg?react")),
  },
  {
    name: "Prisma",
    icon: lazyIcon(() => import("../assets/icons/prisma.svg?react")),
  },
];

export { SpinnerIcon };
