// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Link, MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import {
  renderMetadataHtml,
  renderSitemap,
} from "../build/page-metadata-plugin";
import PageMetadata from "../src/components/page-metadata";
import { getPageMetadata, SITE_URL } from "../src/data/page-metadata";
import { projectsBase } from "../src/data/projects";

const template = readFileSync(resolve("index.html"), "utf8");
afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

describe("project metadata", () => {
  it("supplies route-specific sharing metadata in the HTML without JavaScript", () => {
    for (const project of projectsBase) {
      const html = renderMetadataHtml(
        template,
        getPageMetadata(`/projects/${project.slug}`),
      );
      const page = new DOMParser().parseFromString(html, "text/html");
      expect(page.title).toContain(project.name);
      expect(
        page.querySelector('meta[name="description"]')?.getAttribute("content"),
      ).toBe(project.description);
      expect(
        page.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe(`${SITE_URL}/projects/${project.slug}`);
      expect(
        page.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      ).toBe(`${SITE_URL}/projects/${project.slug}`);
      expect(
        page
          .querySelector('meta[name="twitter:title"]')
          ?.getAttribute("content"),
      ).toBe(page.title);
      expect(
        page.querySelector('script[type="module"]')?.getAttribute("src"),
      ).toBe("/src/main.tsx");
    }
    const sitemap = new DOMParser().parseFromString(
      renderSitemap(),
      "application/xml",
    );
    expect(
      Array.from(
        sitemap.querySelectorAll("loc"),
        (element) => element.textContent,
      ),
    ).toEqual([
      SITE_URL,
      ...projectsBase.map((project) => `${SITE_URL}/projects/${project.slug}`),
    ]);
  });

  it("escapes metadata instead of injecting markup or replacement tokens", () => {
    const metadata = {
      ...getPageMetadata("/"),
      title: '<script>"& $&</script>',
    };
    const html = renderMetadataHtml(template, metadata);
    const page = new DOMParser().parseFromString(html, "text/html");
    expect(page.title).toBe(metadata.title);
    expect(
      page.querySelector('meta[property="og:title"]')?.getAttribute("content"),
    ).toBe(metadata.title);
    expect(page.querySelectorAll("script").length).toBe(3);
  });

  it("updates metadata on SPA navigation and restores home after a noindex route", () => {
    document.head.innerHTML =
      template.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    const { getByText } = render(
      <MemoryRouter initialEntries={["/projects/taxsim"]}>
        <PageMetadata />
        <Link to="/projects/missing">Missing</Link>
        <Link to="/components">Components</Link>
        <Link to="/">Home</Link>
      </MemoryRouter>,
    );
    expect(document.title).toContain("TaxSim");
    fireEvent.click(getByText("Missing"));
    expect(document.title).toContain("não encontrada");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toBe("noindex, follow");
    fireEvent.click(getByText("Components"));
    expect(document.title).toContain("Componentes");
    fireEvent.click(getByText("Home"));
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toContain("index, follow");
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe(SITE_URL);
  });
});
