export type ProjectRecord = {
  id: string;
  templateSlug: string;
};

const projects = new Map<string, ProjectRecord>();

export function createProject(templateSlug: string): ProjectRecord {
  const slug = String(templateSlug || "").trim();
  const id = `${slug}--${crypto.randomUUID()}`;

  const record: ProjectRecord = {
    id,
    templateSlug: slug,
  };

  projects.set(id, record);
  return record;
}

export function ensureProject(projectId: string): ProjectRecord {
  const normalized = String(projectId || "").trim();
  const existing = projects.get(normalized);
  if (existing) return existing;

  const templateSlug = normalized.includes("--") ? normalized.split("--")[0] : normalized;

  const record: ProjectRecord = {
    id: normalized,
    templateSlug,
  };

  projects.set(normalized, record);
  return record;
}

export function getProject(projectId: string): ProjectRecord | null {
  const normalized = String(projectId || "").trim();
  return projects.get(normalized) ?? null;
}
