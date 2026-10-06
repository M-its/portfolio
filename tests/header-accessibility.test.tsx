// @vitest-environment happy-dom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../src/core-components/header";
import { ThemeProvider } from "../src/contexts/theme-context";

vi.mock("../src/core-components/header-desktop-nav", () => ({
  default: () => null,
}));
vi.mock("../src/hooks/use-scrolled", () => ({ default: () => false }));

let desktopListener: (() => void) | undefined;
let desktop = false;
beforeEach(() => {
  desktop = false;
  localStorage.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query === "(min-width: 1024px)" && desktop;
      },
      addEventListener: (_type: string, listener: () => void) => {
        if (query === "(min-width: 1024px)") desktopListener = listener;
      },
      removeEventListener: vi.fn(),
    })),
  );
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.style.cssText = "";
  document.documentElement.style.cssText = "";
});

function openMenu() {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Header />
        <main>
          <button type="button">Background action</button>
        </main>
      </ThemeProvider>
    </MemoryRouter>,
  );
  const toggle = screen.getByRole("button", { name: "Abrir menu" });
  toggle.focus();
  fireEvent.click(toggle);
  return toggle;
}

describe("mobile navigation accessibility", () => {
  it("focuses the menu, traps Tab, and restores focus and page styles on Escape", () => {
    document.body.style.overflow = "clip";
    document.body.style.paddingRight = "3px";
    document.documentElement.style.overflow = "auto";
    const toggle = openMenu();
    const dialog = screen.getByRole("dialog", { name: "Menu de navegação" });
    const logo = screen.getByRole("link", { name: "M-its — voltar ao início" });
    const theme = screen.getByRole("button", {
      name: "Mudar para tema escuro",
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(logo.querySelector("button")).toBeNull();
    expect(document.activeElement?.textContent).toContain("Sobre");
    expect(
      screen
        .getByRole("button", { name: "Background action", hidden: true })
        .closest("main")?.inert,
    ).toBe(true);
    theme.focus();
    fireEvent.keyDown(theme, { key: "Tab" });
    expect(document.activeElement).toBe(logo);
    fireEvent.keyDown(logo, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(theme);
    fireEvent.keyDown(theme, { key: "Escape" });
    expect(document.activeElement).toBe(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.getElementById("mobile-navigation")?.inert).toBe(true);
    expect(document.body.style.overflow).toBe("clip");
    expect(document.body.style.paddingRight).toBe("3px");
    expect(document.documentElement.style.overflow).toBe("auto");
    expect(
      screen.getByRole("button", { name: "Background action" }).closest("main")
        ?.inert,
    ).not.toBe(true);
  });

  it("unlocks the page when resizing into desktop or unmounting an open menu", () => {
    const toggle = openMenu();
    toggle.style.display = "none";
    desktop = true;
    act(() => desktopListener?.());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "M-its — voltar ao início" }),
    );
    expect(document.body.style.overflow).toBe("");
    expect(
      screen.getByRole("button", { name: "Background action" }).closest("main")
        ?.inert,
    ).not.toBe(true);
    cleanup();
    desktop = false;
    openMenu();
    expect(document.body.style.overflow).toBe("hidden");
    cleanup();
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
  });
});
