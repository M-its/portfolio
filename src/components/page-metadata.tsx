import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMetadata } from "../data/page-metadata";

export default function PageMetadata() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.title = metadata.title;
    const tags = {
      'meta[name="description"]': metadata.description,
      'meta[name="robots"]': metadata.robots,
      'meta[property="og:title"]': metadata.title,
      'meta[property="og:description"]': metadata.description,
      'meta[property="og:url"]': metadata.url,
      'meta[property="og:image"]': metadata.image,
      'meta[property="og:image:alt"]': metadata.imageAlt,
      'meta[name="twitter:title"]': metadata.title,
      'meta[name="twitter:description"]': metadata.description,
      'meta[name="twitter:url"]': metadata.url,
      'meta[name="twitter:image"]': metadata.image,
      'meta[name="twitter:image:alt"]': metadata.imageAlt,
    };
    for (const [selector, content] of Object.entries(tags)) {
      document.querySelector(selector)?.setAttribute("content", content);
    }
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", metadata.url);
  }, [pathname]);
  return null;
}
