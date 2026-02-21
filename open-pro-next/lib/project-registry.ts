import { getSupabase, isSupabaseConfigured } from "./supabase";

export type ProjectRecord = {
  id: string;
  templateSlug: string;
  fileContent?: string | null;
  version: number;
};

// ── In-memory fallback (used when Supabase is not configured) ──
const memProjects = new Map<string, ProjectRecord>();

// ── Supabase helpers ──

export async function createProject(templateSlug: string): Promise<ProjectRecord> {
  const slug = String(templateSlug || "").trim();
  const id = `${slug}--${crypto.randomUUID()}`;

  const record: ProjectRecord = { id, templateSlug: slug, fileContent: null, version: 0 };

  if (isSupabaseConfigured()) {
    await getSupabase()!.from("projects").insert({
      id,
      template_slug: slug,
      file_content: null,
      version: 0,
    });
  }

  memProjects.set(id, record);
  return record;
}

export async function ensureProject(projectId: string): Promise<ProjectRecord> {
  const normalized = String(projectId || "").trim();

  // Check memory first
  const mem = memProjects.get(normalized);
  if (mem) return mem;

  // Check Supabase
  if (isSupabaseConfigured()) {
    const { data } = await getSupabase()!
      .from("projects")
      .select("*")
      .eq("id", normalized)
      .single();

    if (data) {
      const record: ProjectRecord = {
        id: data.id,
        templateSlug: data.template_slug,
        fileContent: data.file_content,
        version: data.version ?? 0,
      };
      memProjects.set(normalized, record);
      return record;
    }
  }

  // Create on-the-fly
  const templateSlug = normalized.includes("--") ? normalized.split("--")[0] : normalized;
  const record: ProjectRecord = { id: normalized, templateSlug, fileContent: null, version: 0 };

  if (isSupabaseConfigured()) {
    await getSupabase()!.from("projects").insert({
      id: normalized,
      template_slug: templateSlug,
      file_content: null,
      version: 0,
    });
  }

  memProjects.set(normalized, record);
  return record;
}

export async function getProject(projectId: string): Promise<ProjectRecord | null> {
  const normalized = String(projectId || "").trim();

  const mem = memProjects.get(normalized);
  if (mem) return mem;

  if (isSupabaseConfigured()) {
    const { data } = await getSupabase()!
      .from("projects")
      .select("*")
      .eq("id", normalized)
      .single();

    if (data) {
      const record: ProjectRecord = {
        id: data.id,
        templateSlug: data.template_slug,
        fileContent: data.file_content,
        version: data.version ?? 0,
      };
      memProjects.set(normalized, record);
      return record;
    }
  }

  return null;
}

export async function updateProjectContent(
  projectId: string,
  fileContent: string,
  version: number,
): Promise<void> {
  const normalized = String(projectId || "").trim();

  // Update memory
  const mem = memProjects.get(normalized);
  if (mem) {
    mem.fileContent = fileContent;
    mem.version = version;
  }

  // Update Supabase
  if (isSupabaseConfigured()) {
    await getSupabase()!
      .from("projects")
      .update({ file_content: fileContent, version, updated_at: new Date().toISOString() })
      .eq("id", normalized);
  }
}

export async function getProjectContent(projectId: string): Promise<string | null> {
  const project = await getProject(projectId);
  return project?.fileContent ?? null;
}
