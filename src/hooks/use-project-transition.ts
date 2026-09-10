import { flushSync } from "react-dom";
import { type NavigateFunction, useNavigate } from "react-router-dom";
import { SCROLL_POSITION_SYNC_EVENT } from "./use-scrolled";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

export interface ProjectTransitionLocationState {
  fromCardTransition?: boolean;
}

const PROJECT_IMAGE_TRANSITION_NAME = "project-image";
const HOME_SCROLL_STORAGE_KEY = "scroll:/";
const FREEZE_CLASS = "vt-freeze";
const HOME_ANCHOR_OFFSET = -120;

function scrollInstantly(top: number) {
  // Garante snapshot síncrono mesmo se um estilo antigo ainda estiver ativo — bug #2.
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo({ top, behavior: "auto" });
  document.documentElement.style.removeProperty("scroll-behavior");
}

function saveHomeScrollPosition() {
  // Persiste a origem antes da troca de rota — resolve o bug #3 do diagnóstico.
  sessionStorage.setItem(HOME_SCROLL_STORAGE_KEY, String(window.scrollY));
  window.history.scrollRestoration = "manual";
}

async function decodeImage(image: HTMLImageElement | null) {
  if (!image) return;

  try {
    await image.decode();
  } catch {
    // Se o decode falhar, a imagem já renderizada ainda pode ser capturada.
  }
}

function waitForDestinationHero() {
  const currentHero = document.querySelector<HTMLElement>(
    "[data-project-hero]",
  );
  if (currentHero) return Promise.resolve(currentHero);

  // Aguarda o commit assíncrono do Router antes do snapshot final — resolve o bug #1.
  return new Promise<HTMLElement | null>((resolve) => {
    const observer = new MutationObserver(() => {
      const hero = document.querySelector<HTMLElement>("[data-project-hero]");
      if (!hero) return;

      observer.disconnect();
      globalThis.clearTimeout(timeoutId);
      resolve(hero);
    });
    const timeoutId = globalThis.setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 250);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Restaura a Home antes do próximo paint e devolve uma função de limpeza.
 * Todo scroll de entrada da Home fica aqui para não competir com a transição.
 */
export function initializeHomeScroll(hash: string) {
  const savedScroll = sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY);
  const savedY = savedScroll === null ? Number.NaN : Number(savedScroll);

  if (Number.isFinite(savedY)) {
    // Restaura em ambas as passagens do StrictMode e consome após o mount — bug #3.
    scrollInstantly(savedY);
    const cleanupFrame = window.requestAnimationFrame(() => {
      if (sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY) === savedScroll) {
        sessionStorage.removeItem(HOME_SCROLL_STORAGE_KEY);
      }
    });

    return () => window.cancelAnimationFrame(cleanupFrame);
  }

  scrollInstantly(0);

  if (!hash) return undefined;

  // Âncoras continuam independentes do scroll-behavior global — resolve o bug #2.
  const timeoutId = globalThis.setTimeout(() => {
    const section = document.getElementById(hash.slice(1));
    if (!section) return;

    const top =
      section.getBoundingClientRect().top + window.scrollY + HOME_ANCHOR_OFFSET;
    scrollInstantly(top);
  }, 100);

  return () => globalThis.clearTimeout(timeoutId);
}

export function initializeProjectDetailsScroll(fromCardTransition: boolean) {
  // A callback da transição posiciona a rota no topo antes do snapshot final.
  if (fromCardTransition) return;

  // Acesso direto/refresh não possui origem compartilhada e começa no topo.
  scrollInstantly(0);
}

export function navigateBackToHome(
  navigate: NavigateFunction,
  fromCardTransition: boolean,
) {
  // O state pertence à entrada criada pelo card; acesso direto usa fallback seguro.
  if (fromCardTransition) {
    navigate(-1);
    return;
  }

  navigate("/");
}

export default function useProjectTransition(
  imageFrameRef: React.RefObject<HTMLDivElement | null>,
) {
  const navigate = useNavigate();

  return async (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const documentWithTransitions = document as ViewTransitionDocument;
    const imageFrame = imageFrameRef.current;
    const navigationState = {
      fromCardTransition: true,
    } satisfies ProjectTransitionLocationState;

    event.preventDefault();
    saveHomeScrollPosition();

    const navigateAndPlaceHero = async (waitForHeroImage = false) => {
      flushSync(() => navigate(path, { state: navigationState }));
      didNavigate = true;
      const hero = await waitForDestinationHero();
      if (!hero) return;

      // A página de detalhes sempre começa do topo; a nova primeira dobra mantém
      // a hero visível sem abandonar título, contexto ou ações acima da viewport.
      scrollInstantly(0);
      // Durante a callback da View Transition o browser suspende novos frames.
      // Sincroniza o header no mesmo commit, sem aguardar requestAnimationFrame.
      flushSync(() => {
        window.dispatchEvent(new Event(SCROLL_POSITION_SYNC_EVENT));
      });

      if (waitForHeroImage) {
        await decodeImage(hero.querySelector<HTMLImageElement>("img"));
      }

      hero.getBoundingClientRect();
    };

    let didNavigate = false;

    if (
      !documentWithTransitions.startViewTransition ||
      !imageFrame ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // O fallback mantém scroll e histórico coordenados mesmo sem animação nativa.
      void navigateAndPlaceHero();
      return;
    }

    const projectImage =
      imageFrame.querySelector<HTMLImageElement>(".project-card-img");

    // O snapshot só começa depois que a variante de 1280 px está decodificada.
    // Em condições normais ela já está em cache e esta espera resolve imediatamente.
    await decodeImage(projectImage);

    // Tailwind usa scale/translate individuais; zerar apenas transform não desfaz o hover.
    document.documentElement.classList.add(FREEZE_CLASS);
    projectImage?.getBoundingClientRect();
    imageFrame.getBoundingClientRect();
    imageFrame.style.viewTransitionName = PROJECT_IMAGE_TRANSITION_NAME;
    document.documentElement.dataset.projectTransition = "active";

    const cleanup = () => {
      imageFrame.style.removeProperty("view-transition-name");
      document.documentElement.classList.remove(FREEZE_CLASS);
      delete document.documentElement.dataset.projectTransition;
    };

    try {
      const transition = documentWithTransitions.startViewTransition(() =>
        navigateAndPlaceHero(true),
      );

      transition.finished.then(cleanup, cleanup);
    } catch {
      cleanup();
      if (!didNavigate) void navigateAndPlaceHero();
    }
  };
}
