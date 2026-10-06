// Inert the sibling branches, leaving a nested modal and its ancestors usable.
export function isolateModalBackground(modal: HTMLElement) {
  const previous = new Map<HTMLElement, boolean>();
  let branch: HTMLElement = modal;
  while (branch.parentElement) {
    const parent = branch.parentElement;
    for (const sibling of parent.children) {
      if (sibling instanceof HTMLElement && sibling !== branch) {
        previous.set(sibling, sibling.inert);
        sibling.inert = true;
      }
    }
    if (parent === document.body) break;
    branch = parent;
  }
  return () => {
    for (const [element, wasInert] of previous) element.inert = wasInert;
  };
}
