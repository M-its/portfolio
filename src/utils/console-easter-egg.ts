export function initConsoleEasterEgg() {
  const styles = {
    ascii: "color: #f3e2b3; font-family: monospace;",
    title:
      "color: #fff; background: #000; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;",
    stackHeader:
      "color: #7a6e5f; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px;",
    highlight: "color: #f3e2b3; font-weight: bold;",
    dim: "color: #7a6e5f;",
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
      email: "mitsrael9@gmail.com",
      linkedin: "https://linkedin.com/in/mitsrael-souza-410415162",
      github: "https://github.com/M-its",
      status: "Disponível para novos desafios",
    });
    console.log("%cVamos construir algo juntos.", styles.highlight);
    return "Aguardando seu contato! 😉";
  };
}
