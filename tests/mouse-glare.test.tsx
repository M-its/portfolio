// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MouseGlare from "../src/components/mouse-glare";
import useMouseGlare, {
  MouseGlareProvider,
} from "../src/hooks/use-mouse-glare";

let isDark = true;
let frame: FrameRequestCallback;
let observeVisibility: IntersectionObserverCallback;
vi.mock("../src/hooks/use-media-query", () => ({ default: () => false }));
vi.mock("../src/contexts/theme-context", () => ({
  useTheme: () => ({ isDark }),
}));

beforeEach(() => {
  isDark = true;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        observeVisibility = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Card() {
  const card = useRef<HTMLDivElement>(null);
  const effect = useRef<HTMLDivElement>(null);
  useMouseGlare(card, effect);
  return (
    <div ref={card} data-card>
      <MouseGlare
        ref={effect}
        data-effect
        radius={180}
        borderClassName="rounded-3xl"
        borderColor="white"
        surfaceColor="white"
      />
      <a href="/">Content</a>
    </div>
  );
}
function setup() {
  const view = render(
    <MouseGlareProvider>
      <Card />
    </MouseGlareProvider>,
  );
  const card = view.container.querySelector<HTMLElement>("[data-card]")!;
  const effect = view.container.querySelector<HTMLElement>("[data-effect]")!;
  const geometry = vi
    .spyOn(card, "getBoundingClientRect")
    .mockReturnValue({ left: 50, top: 50, width: 200, height: 100 } as DOMRect);
  act(() =>
    observeVisibility(
      [{ isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    ),
  );
  const spotlight = effect.querySelector<HTMLElement>(
    "[data-glare-spotlight]",
  )!;
  const writes = vi.fn();
  const opacityWrites = vi.fn();
  const mutations = new MutationObserver(() => {});
  mutations.observe(effect, {
    attributes: true,
    subtree: true,
    attributeFilter: ["style"],
  });
  const move = (x: number, y: number) => {
    fireEvent.mouseMove(document, { clientX: x, clientY: y });
    act(() => frame(0));
    for (const mutation of mutations.takeRecords()) {
      if (mutation.target === spotlight) writes();
      if (mutation.target === effect) opacityWrites(effect.style.opacity);
    }
  };
  return {
    ...view,
    card,
    effect,
    geometry,
    writes,
    opacityWrites,
    spotlight,
    move,
  };
}

it("confines changing styles to the effect, skips repeated values and hides once outside the radius", () => {
  const { card, effect, writes, opacityWrites, spotlight, move } = setup();
  move(100, 80);
  expect(card.style.getPropertyValue("--mouse-x")).toBe("");
  expect(spotlight.style.transform).toBe("translate3d(-130px, -150px, 0)");
  const gradients = Array.from(
    effect.querySelectorAll<HTMLElement>("[data-glare-spotlight]"),
  ).map((node) => node.style.backgroundImage);

  expect(Number(effect.style.opacity)).toBe(1);
  writes.mockClear();
  move(100, 80);
  expect(writes).not.toHaveBeenCalled();
  move(140, 100);
  expect(writes).toHaveBeenCalledTimes(1);
  expect(
    Array.from(
      effect.querySelectorAll<HTMLElement>("[data-glare-spotlight]"),
    ).map((node) => node.style.backgroundImage),
  ).toEqual(gradients);
  writes.mockClear();
  move(1000, 1000);
  expect(opacityWrites).toHaveBeenLastCalledWith("0");
  expect(writes).not.toHaveBeenCalled();
  writes.mockClear();
  move(1200, 1200);
  expect(writes).not.toHaveBeenCalled();
});

it("uses current slide geometry, hides inactive slides and stops work for offscreen cards", () => {
  const { card, effect, geometry, writes, spotlight, move } = setup();
  card.className = "swiper-slide swiper-slide-active";
  move(100, 80);
  geometry.mockReturnValue({
    left: 80,
    top: 70,
    width: 200,
    height: 100,
  } as DOMRect);
  move(100, 80);
  expect(spotlight.style.transform).toBe("translate3d(-160px, -170px, 0)");

  card.classList.remove("swiper-slide-active");
  move(100, 80);
  expect(effect.style.opacity).toBe("0");
  card.classList.add("swiper-slide-active");
  move(100, 80);
  act(() =>
    observeVisibility(
      [{ isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver,
    ),
  );
  expect(effect.style.opacity).toBe("0");
  geometry.mockClear();
  writes.mockClear();
  move(110, 90);
  expect(geometry).not.toHaveBeenCalled();
  expect(writes).not.toHaveBeenCalled();
});

it("does not schedule invisible light-theme effects or read inert page geometry", () => {
  isDark = false;
  const { rerender, card, geometry, writes } = setup();
  fireEvent.mouseMove(document, { clientX: 100, clientY: 80 });
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  isDark = true;
  rerender(
    <MouseGlareProvider>
      <Card />
    </MouseGlareProvider>,
  );
  card.setAttribute("inert", "");
  fireEvent.mouseMove(document, { clientX: 100, clientY: 80 });
  act(() => frame(0));
  expect(geometry).not.toHaveBeenCalled();
  expect(writes).not.toHaveBeenCalled();
});

it("keeps the real effects enabled with a docked DevTools-sized window gap", () => {
  vi.spyOn(window, "outerWidth", "get").mockReturnValue(1400);
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(900);
  const { effect, move } = setup();
  move(100, 80);
  expect(Number(effect.style.opacity)).toBe(1);
});
