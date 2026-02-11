let warned = false;

export function warnDevtoolsDisabled() {
  if (!warned) {
    console.warn(
      "%cAviso:",
      "color: orange; font-weight: bold;",
      " O navegador usado possui proteções avançadas (RFP/LibreWolf).",
      "\nAlguns recursos (como cursor custom condicionado ao DevTools) podem não funcionar corretamente.",
    );
    warned = true;
  }
}
