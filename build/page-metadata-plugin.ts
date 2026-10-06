import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { Plugin } from "vite";
import {
  getPageMetadata,
  SITE_URL,
  type PageMetadataData,
} from "../src/data/page-metadata";
import { projectsBase } from "../src/data/projects";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Sharing crawlers must receive route metadata before running JavaScript.
export function renderMetadataHtml(html: string, metadata: PageMetadataData) {
  const values: Record<string, string> = {
    description: metadata.description,
    robots: metadata.robots,
    "og:title": metadata.title,
    "og:description": metadata.description,
    "og:url": metadata.url,
    "og:image": metadata.image,
    "og:image:alt": metadata.imageAlt,
    "twitter:title": metadata.title,
    "twitter:description": metadata.description,
    "twitter:url": metadata.url,
    "twitter:image": metadata.image,
    "twitter:image:alt": metadata.imageAlt,
  };
  return html
    .replace(
      /<title>[\s\S]*?<\/title>/,
      () => `<title>${escapeHtml(metadata.title)}</title>`,
    )
    .replace(
      /<meta\s+(?:name|property)="([^"]+)"\s+content="[^"]*"\s*\/?>/g,
      (tag: string, key: string) =>
        values[key] === undefined
          ? tag
          : tag.replace(
              /content="[^"]*"/,
              () => `content="${escapeHtml(values[key])}"`,
            ),
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/,
      (_match, before: string, after: string) =>
        `${before}${escapeHtml(metadata.url)}${after}`,
    );
}

export function renderSitemap() {
  const paths = [
    "",
    ...projectsBase.map((project) => `/projects/${project.slug}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
}

export default function pageMetadataPlugin(): Plugin {
  let outputDirectory: string;
  let isBuild = false;
  return {
    name: "portfolio-page-metadata",
    configResolved(config) {
      isBuild = config.command === "build";
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== "/sitemap.xml") return next();
        response.setHeader("Content-Type", "application/xml; charset=utf-8");
        response.end(renderSitemap());
      });
    },
    async closeBundle() {
      if (!isBuild) return;
      const html = await readFile(
        resolve(outputDirectory, "index.html"),
        "utf8",
      );
      const paths = [
        "/",
        ...projectsBase.map((project) => `/projects/${project.slug}`),
        "/components",
      ];
      for (const path of paths) {
        const filename = resolve(
          outputDirectory,
          path === "/" ? "index.html" : `.${path}.html`,
        );
        await mkdir(dirname(filename), { recursive: true });
        await writeFile(
          filename,
          renderMetadataHtml(html, getPageMetadata(path)),
        );
      }
      await writeFile(resolve(outputDirectory, "sitemap.xml"), renderSitemap());
    },
  };
}
