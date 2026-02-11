export interface ProjectData {
  repository: string;
  description: string;
  image: string;
  github_repo: string;
  homepage: string;
  languages: string[];
  featured?: boolean;
}

export const projectsBase: ProjectData[] = [
  {
    repository: "food-explorer-web",
    description:
      "Uma aplicação de ponta a ponta com front-end e back-end, utilizando as teconologias aprendidas no Explorer, simulando um restaurante.",
    image:
      "https://raw.githubusercontent.com/M-its/food-explorer-web/refs/heads/main/src/assets/home.png",
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
    featured: true,
  },
  {
    repository: "gallery-plus",
    description: "Projeto de galeria do curso da RocketSeat.",
    image: "images/gallery-plus.png",
    github_repo: "https://github.com/M-its/gallery-plus",
    homepage: "https://mits-food-explorer-web.netlify.app/",
    languages: [
      "ReactJS",
      "Typescript",
      "NodeJS",
      "Fastify",
      "Radix-ui",
      "Tailwind",
      "Axios",
      "Zod",
      "Sonner",
    ],
  },
  {
    repository: "weather-appJS",
    description:
      "Simple weather app inspired by florinpop17 app-ideas repository to pratice coding.",
    github_repo: "https://github.com/M-its/weather-appJS",
    homepage: "https://mits-food-explorer-web.netlify.app/",
    image:
      "https://raw.githubusercontent.com/M-its/weather-appJS/refs/heads/main/weather.png",
    languages: ["JavaScript", "HTML", "CSS", "Custom Router", "Tailwind"],
  },
  {
    repository: "RocketMovies",
    description:
      "Front-end da aplicação RocketMovies para o curso da RocketSeat.",
    github_repo: "https://github.com/M-its/RocketMovies",
    homepage: "https://mits-food-explorer-web.netlify.app/",
    image:
      "https://raw.githubusercontent.com/M-its/RocketMovies/refs/heads/main/src/assets/home.png",
    languages: [
      "React",
      "Vite",
      "React-DOM",
      "React-icons",
      "React-router-DOM",
      "Styled-components",
    ],
  },
];
