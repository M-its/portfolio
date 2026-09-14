let projectDetailsModule: ReturnType<
  typeof importProjectDetailsPage
> | null = null;

function importProjectDetailsPage() {
  return import("../pages/page-project-details");
}

export function loadProjectDetailsPage() {
  projectDetailsModule ??= importProjectDetailsPage();
  return projectDetailsModule;
}
