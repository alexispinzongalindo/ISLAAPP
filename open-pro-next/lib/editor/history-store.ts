type HistoryEntry = {
  filePath: string;
  before: string;
  after: string;
};

type ProjectHistory = {
  undo: HistoryEntry[];
  redo: HistoryEntry[];
  version: number;
};

const histories = new Map<string, ProjectHistory>();

function ensure(projectId: string): ProjectHistory {
  const key = String(projectId || "").trim();
  const existing = histories.get(key);
  if (existing) return existing;

  const next: ProjectHistory = { undo: [], redo: [], version: 0 };
  histories.set(key, next);
  return next;
}

export function recordChange(projectId: string, entry: HistoryEntry) {
  const history = ensure(projectId);
  history.undo.push(entry);
  history.redo = [];
  history.version += 1;
  return { version: history.version, canUndo: history.undo.length > 0, canRedo: history.redo.length > 0 };
}

export function undoChange(projectId: string): { entry: HistoryEntry | null; version: number; canUndo: boolean; canRedo: boolean } {
  const history = ensure(projectId);
  const entry = history.undo.pop() ?? null;
  if (entry) {
    history.redo.push(entry);
    history.version += 1;
  }
  return { entry, version: history.version, canUndo: history.undo.length > 0, canRedo: history.redo.length > 0 };
}

export function redoChange(projectId: string): { entry: HistoryEntry | null; version: number; canUndo: boolean; canRedo: boolean } {
  const history = ensure(projectId);
  const entry = history.redo.pop() ?? null;
  if (entry) {
    history.undo.push(entry);
    history.version += 1;
  }
  return { entry, version: history.version, canUndo: history.undo.length > 0, canRedo: history.redo.length > 0 };
}

export function getHistoryState(projectId: string) {
  const history = ensure(projectId);
  return { version: history.version, canUndo: history.undo.length > 0, canRedo: history.redo.length > 0 };
}
