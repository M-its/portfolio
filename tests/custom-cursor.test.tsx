// @vitest-environment happy-dom
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomCursor from "../src/components/custom-cursor";

let frame: FrameRequestCallback;
let target: Element | null;
let reducedMotion: boolean;
let finePointer: boolean;
let forcedColors: boolean;

beforeEach(() => {
  reducedMotion = false;
  finePointer = true;
  forcedColors = false;
  target = null;
  const originalMatchMedia = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((query) => {
    const media = originalMatchMedia(query);
    Object.defineProperty(media, "matches", {
      get: () =>
        query.includes("reduced-motion")
          ? reducedMotion
          : query.includes("forced-colors")
            ? forcedColors
            : finePointer,
    });
    return media;
  });
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => target);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function tick() {
  act(() => frame(0));
}
function expectRingSize(ring: HTMLElement, diameter: number) {
  const visual = ring.querySelector("svg")!;
  const scale = Number(visual.style.transform.slice(6, -1));
  expect(55 * scale + Number.parseFloat(visual.style.strokeWidth)).toBeCloseTo(
    diameter,
  );
  expect(ring.style.width).toBe("");
  expect(ring.style.height).toBe("");
  expect(visual.querySelector("circle")!.getAttribute("vector-effect")).toBe(
    "non-scaling-stroke",
  );
}
function setup() {
  const { container } = render(
    <div>
      <button type="button">
        <span>Action</span>
      </button>
      <input aria-label="Field" />
      <CustomCursor />
    </div>,
  );
  const overlay = document.body.querySelector("[aria-hidden='true']")!;
  const dot = overlay.children[0] as HTMLElement;
  const ring = overlay.children[1] as HTMLElement;
  return { container, dot, ring };
}

describe("custom cursor interactions", () => {
  it("replaces the native cursor only after movement and tracks the precise click point", () => {
    const { container, dot, ring } = setup();
    expect(
      document.documentElement.classList.contains("custom-cursor-active"),
    ).toBe(false);
    target = container.querySelector("span");
    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    tick();
    expect(
      document.documentElement.classList.contains("custom-cursor-active"),
    ).toBe(true);
    expect(dot.style.transform).toBe("translate3d(120px, 80px, 0)");
    expect(ring.style.transform).toBe(dot.style.transform);
    fireEvent.mouseMove(window, { clientX: 520, clientY: 180 });
    tick();
    expect(dot.style.transform).toBe("translate3d(520px, 180px, 0)");
    expect(ring.style.transform).toBe("translate3d(180px, 95px, 0)");
    expectRingSize(ring, 56);
    fireEvent.pointerDown(target!, { button: 0 });
    tick();
    expectRingSize(ring, 40);
    fireEvent.pointerUp(target!);
    tick();
    expectRingSize(ring, 56);
  });
  it("updates hover when content changes under a stationary pointer and distinguishes disabled controls", async () => {
    const { container, ring } = setup();
    target = container.querySelector("button");
    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    tick();
    expectRingSize(ring, 56);
    target = container.querySelector("input");
    fireEvent.scroll(document);
    tick();
    expectRingSize(ring, 48);
    target = container.querySelector("button");
    (target as HTMLButtonElement).disabled = true;
    await waitFor(() => expect(requestAnimationFrame).toHaveBeenCalledTimes(3));
    tick();
    expectRingSize(ring, 28);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(3);
  });
  it("hides over third-party challenges and restores the native cursor on blur or unmount", () => {
    const { container, dot, ring } = setup();
    target = document.createElement("iframe");
    fireEvent.mouseOver(target, { clientX: 120, clientY: 80 });
    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    tick();
    expect(dot.style.opacity).toBe("0");
    expect(ring.style.opacity).toBe("0");
    target = container.querySelector("button");
    fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });
    tick();
    expect(ring.style.opacity).toBe("1");
    fireEvent.blur(window);
    expect(
      document.documentElement.classList.contains("custom-cursor-active"),
    ).toBe(false);
    expect(ring.style.opacity).toBe("0");
    fireEvent.mouseMove(window, { clientX: 150, clientY: 80 });
    cleanup();
    expect(
      document.documentElement.classList.contains("custom-cursor-active"),
    ).toBe(false);
  });
  it.each(["reduced motion", "coarse pointer", "forced colors"])(
    "preserves the native fallback for %s",
    (preference) => {
      reducedMotion = preference === "reduced motion";
      finePointer = preference !== "coarse pointer";
      forcedColors = preference === "forced colors";
      render(<CustomCursor />);
      fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
      expect(document.body.querySelector("[aria-hidden='true']")).toBeNull();
      expect(
        document.documentElement.classList.contains("custom-cursor-active"),
      ).toBe(false);
    },
  );
});
