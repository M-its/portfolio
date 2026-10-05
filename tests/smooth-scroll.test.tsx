// @vitest-environment happy-dom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SmoothScroll from "../src/components/smooth-scroll";
import { MOBILE_MENU_STATE_EVENT } from "../src/utils/ui-events";

let frame: FrameRequestCallback;
beforeEach(() => {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) => ({ matches: query.includes("pointer: fine") }) as MediaQueryList,
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
    4000,
  );
  vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
});
afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  vi.restoreAllMocks();
});

it("preserves the gradual wheel easing and keeps only one pending frame", () => {
  render(<SmoothScroll />);
  expect(fireEvent.wheel(document.body, { deltaY: 600 })).toBe(false);
  frame(0);
  expect(window.scrollTo).toHaveBeenLastCalledWith(0, 60);
  frame(16);
  expect(window.scrollTo).toHaveBeenLastCalledWith(0, 114);
  fireEvent.wheel(document.body, { deltaY: 100 });
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(3);
});

it("stops pending page motion while keeping modal content scrollable", () => {
  const { container } = render(
    <>
      <SmoothScroll />
      <div data-native-scroll />
    </>,
  );
  fireEvent.wheel(document.body, { deltaY: 100 });
  document.body.style.overflow = "hidden";
  frame(0);
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  expect(window.scrollTo).not.toHaveBeenCalled();
  expect(fireEvent.wheel(document.body, { deltaY: 100 })).toBe(false);
  expect(
    fireEvent.wheel(container.querySelector("[data-native-scroll]")!, {
      deltaY: 100,
    }),
  ).toBe(true);
  document.body.style.overflow = "";
  fireEvent.wheel(document.body, { deltaY: 100 });
  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
});

it("honors the mobile menu lock and removes the blocker on unmount", () => {
  const { container, unmount } = render(
    <>
      <SmoothScroll />
      <div data-native-scroll />
    </>,
  );
  window.dispatchEvent(
    new CustomEvent(MOBILE_MENU_STATE_EVENT, { detail: { open: true } }),
  );
  expect(
    fireEvent.wheel(container.querySelector("[data-native-scroll]")!, {
      deltaY: 100,
    }),
  ).toBe(false);
  window.dispatchEvent(
    new CustomEvent(MOBILE_MENU_STATE_EVENT, { detail: { open: false } }),
  );
  fireEvent.wheel(document.body, { deltaY: 100 });
  expect(window.requestAnimationFrame).toHaveBeenCalledOnce();
  unmount();
  expect(fireEvent.wheel(document.body, { deltaY: 100 })).toBe(true);
});
