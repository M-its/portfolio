<div align="center">

# ✦ Mitsrael Souza — Portfolio 2026

**Full-Stack Developer · JavaScript Ecosystem · React · TypeScript · Node.js**

[![Deploy](https://img.shields.io/badge/Deploy-Live-brightgreen?style=flat-square&logo=netlify)](https://mits-food-explorer-web.netlify.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vite.dev/)

</div>

---

## Sobre o Projeto

Portfolio pessoal desenvolvido com foco em **performance**, **acessibilidade** e **experiência de usuário refinada**. Cada detalhe foi pensado para transmitir identidade — desde o cursor customizado até as animações de entrada por seção.

> *"Resolvendo problemas complexos com código elegante e escalável."*

---

## Funcionalidades

- **Intro Splash** — Tela de boas-vindas com partículas animadas via Canvas API, exibida apenas na primeira visita (persiste via `localStorage`)
- **Custom Cursor** — Cursor personalizado com blend-mode `difference`, detecção de hover em elementos interativos e respeito à preferência `prefers-reduced-motion`
- **Header Flutuante** — Navbar que transforma em pill flutuante ao rolar a página, com backdrop-blur e animação suave via Framer Motion
- **Menu Mobile Fullscreen** — Animação de entrada/saída com stagger nos links e suporte a `Escape` e clique fora para fechar
- **Mouse Glare Effect** — Efeito de "revelar borda" baseado na posição do cursor, com listener global único via Context API para máxima performance
- **Seções Animadas** — Componente `AnimatedSection` reutilizável com variantes (`fadeUp`, `fadeDown`, `blur`), delay configurável e controle de repetição no viewport
- **Techs Stack** — Carrossel de tecnologias agrupadas por categoria com Swiper.js e ícones carregados via `React.lazy`
- **Cards de Projeto** — Cards com hover scale, efeito glare e overflow de tags gerenciado pelo `OverflowList`
- **Tema Claro/Escuro** — Toggle com animação e persistência no `localStorage`, via Context API
- **Indicador de Scroll** — Animação pulsante com micro-interação no hover

---

## Stack Técnica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | 5.8 | Tipagem estática |
| Tailwind CSS | 4 | Estilização utility-first |
| Framer Motion | 12 | Animações declarativas |
| tailwind-variants | 3 | Variantes de componentes type-safe |
| React Router | 7 | Roteamento client-side |
| Swiper.js | 11 | Carrossel de tecnologias |

### Tooling
| Ferramenta | Uso |
|---|---|
| Vite 7 | Build tool e dev server |
| vite-plugin-svgr | Importar SVGs como componentes React |
| Biome | Linter e formatter |
| pnpm | Gerenciador de pacotes |
| TypeScript strict | `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` |

---

## Arquitetura

```
src/
├── assets/
│   ├── icons/          # SVGs de tecnologias e ações
│   └── images/         # Imagens e logo
├── components/         # Componentes de UI genéricos e reutilizáveis
│   ├── animated-section.tsx   # Wrapper de animação reutilizável
│   ├── button.tsx             # Componente polimórfico com variantes
│   ├── card.tsx               # Card base com forwardRef
│   ├── custom-cursor.tsx      # Cursor customizado com rAF
│   ├── text.tsx               # Sistema tipográfico
│   └── ...
├── contexts/
│   └── theme-context.tsx      # Tema global com Context API
├── core-components/    # Componentes de feature/seção
│   ├── header.tsx
│   ├── project-card.tsx
│   ├── tech-card.tsx
│   └── ...
├── data/
│   ├── constants.ts    # Links sociais e configurações
│   ├── projects.ts     # Dados dos projetos
│   └── techs.ts        # Dados das tecnologias com lazy icons
├── hooks/              # Hooks customizados
│   ├── use-mouse-glare.tsx    # Glare global via Context
│   ├── useOnScreen.ts         # IntersectionObserver
│   ├── use-scrolled.ts        # Estado de scroll com Framer
│   └── ...
├── pages/
│   ├── layout-main.tsx
│   └── page-home.tsx
└── utils/
    └── warn-once.ts
```

### Decisões de Arquitetura

**Componente Polimórfico `Button`** — Aceita uma prop `as` que permite renderizar como `<a>`, `<button>` ou qualquer elemento HTML, mantendo tipagem correta via TypeScript generics.

**`MouseGlareProvider`** — Em vez de adicionar um listener `mousemove` por card, um único listener global distribui as coordenadas para todos os cards registrados via `useRef<Set<MouseHandler>>`, eliminando overhead de múltiplos listeners independente do número de cards na tela.

**Lazy Icons** — Todos os ícones SVG são carregados com `React.lazy` + `Suspense`, garantindo que apenas os ícones visíveis na tela sejam baixados, reduzindo o bundle inicial.

**`AnimatedSection`** — Abstrai completamente a lógica de `IntersectionObserver` + Framer Motion. Suporta qualquer tag HTML via prop `as`, delay, variantes pré-definidas e controle de repetição por viewport.

---

## Instalação e Execução

### Pré-requisitos

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (o projeto usa `only-allow pnpm` via `preinstall`)

```bash
# Instalar pnpm globalmente (caso necessário)
npm install -g pnpm
```

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/M-its/portfolio.git
cd portfolio

# 2. Instale as dependências
pnpm install

# 3. Inicie o servidor de desenvolvimento
pnpm dev
```

O projeto estará disponível em `http://localhost:5173`.

### Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento com HMR
pnpm build        # Build de produção (TypeScript + Vite)
pnpm preview      # Preview do build de produção
pnpm lint         # ESLint + Biome lint
pnpm format       # Formata o código com Biome
pnpm format:check # Verifica formatação sem escrever
```

---

## Performance

- **SVGs como componentes React** via `vite-plugin-svgr` — sem requests HTTP extras para ícones
- **`React.lazy`** em todos os ícones de tecnologia — code splitting automático por ícone
- **`IntersectionObserver`** para animações — evita cálculos de scroll no thread principal
- **`will-change: transform`** no cursor — promove o elemento para sua própria camada de composição
- **`requestAnimationFrame` com lerp** no cursor — animação suave sem `setInterval`
- **Listener global único** para o efeito glare — O(1) listeners independente do número de cards
- **Canvas com `clearRect` + rAF** nas partículas do splash — renderização eficiente sem overhead de DOM

---

## Acessibilidade

- `prefers-reduced-motion` respeitado — cursor customizado e partículas desativados automaticamente
- `aria-label` em todos os botões icônicos e links externos
- Suporte a navegação por teclado no menu mobile (`Escape` para fechar)
- `target="_blank"` sempre acompanhado de `rel="noopener noreferrer"`
- `loading="lazy"` e `decoding="async"` nas imagens dos project cards

---

## Projetos em Destaque

| Projeto | Descrição | Stack |
|---|---|---|
| [food-explorer-web](https://github.com/M-its/food-explorer-web) | App de restaurante full-stack (Explorer final) | React, Node, Express, SQLite |
| [gallery-plus](https://github.com/M-its/gallery-plus) | Galeria de imagens com upload | React, TS, Fastify, Tailwind |
| [weather-appJS](https://github.com/M-its/weather-appJS) | App de clima com roteamento customizado | JS, HTML, CSS, Tailwind |
| [RocketMovies](https://github.com/M-its/RocketMovies) | Catálogo de filmes pessoais | React, Vite, Styled Components |

---

## Contato

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-M--its-181717?style=for-the-badge&logo=github)](https://github.com/M-its)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mitsrael_Souza-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/mitsrael-souza-410415162/)

</div>

---

<div align="center">

Feito com ♥ por **Mitsrael Souza** · © 2026

</div>