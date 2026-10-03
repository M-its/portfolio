function writeConsoleEasterEgg() {
  const rootStyles = getComputedStyle(document.documentElement);
  const palette = (token: string) => rootStyles.getPropertyValue(token).trim();
  const accent = palette("--palette-sepia-200");
  const muted = palette("--palette-sepia-700");
  const white = palette("--palette-white");
  const black = palette("--palette-black");

  const styles = {
    ascii: `color: ${accent}; font-family: monospace;`,
    title:
      `color: ${white}; background: ${black}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;`,
    stackHeader:
      `color: ${muted}; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px;`,
    highlight: `color: ${accent}; font-weight: bold;`,
    dim: `color: ${muted};`,
  };

  // ── 1. Boas-vindas
  console.log(
    "%c" +
      `
    ███╗   ███╗    ██║████████╗███████╗
    ████╗ ████║    ██║╚══██╔══╝██╔════╝
    ██╔████╔██║    ██║   ██║   ███████╗
    ██║╚██╔╝██║    ██║   ██║   ╚════██║
    ██║ ╚═╝ ██║    ██║   ██║   ███████║
    ╚═╝     ╚═╝    ╚═╝   ╚═╝   ╚══════╝
`,
    styles.ascii,
  );
  console.log("%c ⚡ Mitsrael Souza | Full-Stack Developer ", styles.title);

  // ── 3. Tech stack
  console.log("\n%cStack 🛠️", styles.stackHeader);
  console.table({
    Frontend: "React, Next, TypeScript, Tailwind, Vite, React Router",
    Backend: "Node, Express, Fastify, Postgre SQL, Zod, JWT",
    Ferramentas: "Git, GitHub, Docker, Vitest, Jest, Swagger",
  });

  // ── 4. Comando de Contato
  console.log(
    "%cDigite %ccontratar()%c no console para ver meus contatos. 📞",
    styles.dim,
    styles.highlight,
    styles.dim,
  );

  (window as unknown as Record<string, unknown>).contratar = () => {
    console.log(
      "%cOlá! Fico feliz que tenha chegado até aqui 🤝",
      styles.highlight,
    );
    console.table({
      email: "mitsrael.dev@proton.me",
      linkedin: "https://linkedin.com/in/mitsrael-souza-410415162",
      github: "https://github.com/M-its",
      status: "Disponível para novos desafios",
    });
    console.log("%cVamos construir algo juntos.", styles.highlight);
    return "Aguardando seu contato! 😉";
  };
}

export function initConsoleEasterEgg() {
  const scheduleWrite = () => requestAnimationFrame(writeConsoleEasterEgg);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleWrite, {
      once: true,
    });
    return;
  }

  scheduleWrite();
}
