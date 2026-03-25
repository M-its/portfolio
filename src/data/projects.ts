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
    repository: "food-explorer-web",
    name: "Food Explorer",
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
    repository: "weather-appJS",
    name: "Weather App",
    description:
      "Simple weather app inspired by florinpop17 app-ideas repository to pratice coding.",
    github_repo: "https://github.com/M-its/weather-appJS",
    homepage: "https://wheather-app-mauve.vercel.app/",
    image:
      "https://raw.githubusercontent.com/M-its/weather-appJS/refs/heads/main/weather.png",
    languages: ["JavaScript", "HTML", "CSS", "Custom Router", "Tailwind"],
  },
  {
    repository: "RocketMovies",
    name: "Rocket Movies",
    description:
      "Front-end da aplicação RocketMovies para o curso da RocketSeat.",
    github_repo: "https://github.com/M-its/RocketMovies",
    homepage: "https://mits-rocketmovies.netlify.app/",
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
