import type { Frame } from '../types/frame';

const DB_NAME = 'gif-maker-db';
const DB_VERSION = 4;
const FRAMES_STORE = 'frames';
const IMAGES_STORE = 'images';
const PROJECTS_STORE = 'projects';
const ANIMATION_PRESETS_STORE = 'animationPresets';
const PROJECT_ID_INDEX = 'projectId';
const LEGACY_PROJECT_STORE = 'project';
const LEGACY_PROJECT_META_KEY = 'meta';

export const DEFAULT_PROJECT_NAME = 'Untitled Project';

export type StoredFrameMeta = Omit<Frame, 'beforeImage' | 'afterImage'> & { projectId: string };

export interface ProjectRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// A saved combination of animation settings (not tied to any one frame or project)
// that can be applied to any frame later.
export interface AnimationPreset {
  id: string;
  name: string;
  animationStyle: Frame['animationStyle'];
  duration: number;
  pauseDuration: number;
  sliderOffset?: number;
  sliderDirection?: Frame['sliderDirection'];
  createdAt: number;
}

interface LegacyProjectMeta {
  name?: string;
  createdAt?: number;
  updatedAt?: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (event) => {
        const db = req.result;
        const tx = req.transaction!;
        const oldVersion = event.oldVersion;

        if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
          db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(IMAGES_STORE)) {
          db.createObjectStore(IMAGES_STORE);
        }
        if (!db.objectStoreNames.contains(ANIMATION_PRESETS_STORE)) {
          db.createObjectStore(ANIMATION_PRESETS_STORE, { keyPath: 'id' });
        }

        let framesStore: IDBObjectStore;
        if (!db.objectStoreNames.contains(FRAMES_STORE)) {
          framesStore = db.createObjectStore(FRAMES_STORE, { keyPath: 'id' });
          framesStore.createIndex(PROJECT_ID_INDEX, PROJECT_ID_INDEX);
        } else {
          framesStore = tx.objectStore(FRAMES_STORE);
          if (!framesStore.indexNames.contains(PROJECT_ID_INDEX)) {
            framesStore.createIndex(PROJECT_ID_INDEX, PROJECT_ID_INDEX);
          }
        }

        // Migrate legacy single-project data (schema v2 and earlier) into the new
        // multi-project schema: every existing frame belonged to one implicit project.
        if (oldVersion < 3 && db.objectStoreNames.contains(LEGACY_PROJECT_STORE)) {
          const projectsStore = tx.objectStore(PROJECTS_STORE);
          const legacyStore = tx.objectStore(LEGACY_PROJECT_STORE);
          const legacyReq = legacyStore.get(LEGACY_PROJECT_META_KEY);

          legacyReq.onsuccess = () => {
            const legacyMeta = legacyReq.result as LegacyProjectMeta | undefined;
            const now = Date.now();
            const newProjectId = crypto.randomUUID();
            const newProject: ProjectRecord = {
              id: newProjectId,
              name: legacyMeta?.name ?? DEFAULT_PROJECT_NAME,
              createdAt: legacyMeta?.createdAt ?? now,
              updatedAt: legacyMeta?.updatedAt ?? now,
            };

            const cursorReq = framesStore.openCursor();
            let migratedAny = false;
            cursorReq.onsuccess = () => {
              const cursor = cursorReq.result;
              if (cursor) {
                const record = cursor.value as StoredFrameMeta;
                if (!record.projectId) {
                  record.projectId = newProjectId;
                  cursor.update(record);
                  migratedAny = true;
                }
                cursor.continue();
              } else {
                // Only create a project record if there was actual legacy content to carry over.
                if (migratedAny || legacyMeta) {
                  projectsStore.put(newProject);
                }
                db.deleteObjectStore(LEGACY_PROJECT_STORE);
              }
            };
          };
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function runRequest<T>(store: IDBObjectStore, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return runRequest(tx.objectStore(storeName), fn);
}

export function imageKey(frameId: string, type: 'before' | 'after'): string {
  return `${frameId}:${type}`;
}

export function toStoredMeta(frame: Frame, projectId: string): StoredFrameMeta {
  return {
    id: frame.id,
    projectId,
    name: frame.name,
    width: frame.width,
    height: frame.height,
    x: frame.x,
    y: frame.y,
    sliderPosition: frame.sliderPosition,
    sliderDirection: frame.sliderDirection,
    sliderOffset: frame.sliderOffset,
    duration: frame.duration,
    pauseDuration: frame.pauseDuration,
    animationStyle: frame.animationStyle,
  };
}

export async function getFrameMetasForProject(projectId: string): Promise<StoredFrameMeta[]> {
  const db = await openDB();
  const tx = db.transaction(FRAMES_STORE, 'readonly');
  return runRequest(tx.objectStore(FRAMES_STORE), (s) =>
    s.index(PROJECT_ID_INDEX).getAll(IDBKeyRange.only(projectId))
  );
}

export async function putFrameMeta(meta: StoredFrameMeta): Promise<void> {
  await withStore(FRAMES_STORE, 'readwrite', (s) => s.put(meta));
}

export async function deleteFrameMeta(id: string): Promise<void> {
  await withStore(FRAMES_STORE, 'readwrite', (s) => s.delete(id));
}

export async function putImageBlob(key: string, blob: Blob): Promise<void> {
  await withStore(IMAGES_STORE, 'readwrite', (s) => s.put(blob, key));
}

export async function getImageBlob(key: string): Promise<Blob | undefined> {
  return withStore(IMAGES_STORE, 'readonly', (s) => s.get(key));
}

export async function deleteImageBlob(key: string): Promise<void> {
  await withStore(IMAGES_STORE, 'readwrite', (s) => s.delete(key));
}

export async function swapImageBlobs(frameId: string): Promise<void> {
  const beforeKey = imageKey(frameId, 'before');
  const afterKey = imageKey(frameId, 'after');
  const [beforeBlob, afterBlob] = await Promise.all([getImageBlob(beforeKey), getImageBlob(afterKey)]);

  await Promise.all([
    afterBlob ? putImageBlob(beforeKey, afterBlob) : deleteImageBlob(beforeKey),
    beforeBlob ? putImageBlob(afterKey, beforeBlob) : deleteImageBlob(afterKey),
  ]);
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  const list = await withStore<ProjectRecord[]>(PROJECTS_STORE, 'readonly', (s) => s.getAll());
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  return withStore(PROJECTS_STORE, 'readonly', (s) => s.get(id));
}

export async function createProject(name: string): Promise<ProjectRecord> {
  const now = Date.now();
  const project: ProjectRecord = {
    id: crypto.randomUUID(),
    name: name.trim() || DEFAULT_PROJECT_NAME,
    createdAt: now,
    updatedAt: now,
  };
  await withStore(PROJECTS_STORE, 'readwrite', (s) => s.put(project));
  return project;
}

// Creates the project record if it doesn't exist yet (e.g. the editor was opened
// directly at a fresh id), otherwise returns the existing one untouched.
export async function ensureProject(id: string, defaultName: string): Promise<ProjectRecord> {
  const existing = await getProject(id);
  if (existing) return existing;
  const now = Date.now();
  const project: ProjectRecord = { id, name: defaultName, createdAt: now, updatedAt: now };
  await withStore(PROJECTS_STORE, 'readwrite', (s) => s.put(project));
  return project;
}

export async function renameProject(id: string, name: string): Promise<void> {
  const existing = await getProject(id);
  const now = Date.now();
  const project: ProjectRecord = {
    id,
    name: name.trim() || DEFAULT_PROJECT_NAME,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await withStore(PROJECTS_STORE, 'readwrite', (s) => s.put(project));
}

export async function touchProject(id: string): Promise<void> {
  const existing = await getProject(id);
  if (!existing) return;
  await withStore(PROJECTS_STORE, 'readwrite', (s) => s.put({ ...existing, updatedAt: Date.now() }));
}

export async function getAllAnimationPresets(): Promise<AnimationPreset[]> {
  const list = await withStore<AnimationPreset[]>(ANIMATION_PRESETS_STORE, 'readonly', (s) => s.getAll());
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createAnimationPreset(
  name: string,
  settings: Omit<AnimationPreset, 'id' | 'name' | 'createdAt'>
): Promise<AnimationPreset> {
  const preset: AnimationPreset = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled Style',
    createdAt: Date.now(),
    ...settings,
  };
  await withStore(ANIMATION_PRESETS_STORE, 'readwrite', (s) => s.put(preset));
  return preset;
}

export async function deleteAnimationPreset(id: string): Promise<void> {
  await withStore(ANIMATION_PRESETS_STORE, 'readwrite', (s) => s.delete(id));
}
