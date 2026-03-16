import GitHubIcon from "../assets/icons/github.svg?react";
import LinkedInIcon from "../assets/icons/linkedin.svg?react";
import CVIcon from "../assets/icons/cv.svg?react";

export const SOCIAL_LINKS = [
  {
    href: "https://github.com/M-its",
    icon: GitHubIcon,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/mitsrael-souza-410415162/",
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  {
    href: "/resume.pdf",
    icon: CVIcon,
    label: "Currículo",
    download: true,
  },
];

export const BUTTON_CONFIG = {
  icon: {
    mode: "icon" as const,
    iconVariant: "secondary" as const,
    size: "xl" as const,
  },
  button: {
    mode: "button" as const,
    iconVariant: "primary" as const,
    size: "md" as const,
  },
};
