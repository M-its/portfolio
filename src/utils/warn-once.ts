function isPrivacyHardenedBrowser(): boolean {
  const ua = navigator.userAgent;

  const isLibreWolf = ua.includes("LibreWolf");

  // Try to detect Tor Browser
  const hasRFP =
    window.outerWidth === window.innerWidth &&
    screen.width === 1000 &&
    screen.height === 900;

  return isLibreWolf || hasRFP;
}

let warned = false;

export function warnDevtoolsDisabled() {
  if (!warned && isPrivacyHardenedBrowser()) {
    console.warn(
      "%cAviso:",
      "color: orange; font-weight: bold;",
      " O navegador usado possui proteções avançadas (RFP/LibreWolf).",
      "\nAlguns recursos (como cursor custom condicionado ao DevTools) podem não funcionar corretamente.",
    );
    warned = true;
  }
}
