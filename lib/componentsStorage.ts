import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { STORAGE_CONFIG } from '@/lib/config';
import { ComponentRegistryItem } from '@/types/components';

const DATA_DIR = path.join(process.cwd(), STORAGE_CONFIG.dataDir);
const COMPONENTS_FILE = path.join(DATA_DIR, STORAGE_CONFIG.componentsFileName);

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readAll(): Promise<ComponentRegistryItem[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(COMPONENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAll(items: ComponentRegistryItem[]) {
  await ensureDataDir();
  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function getComponents(): Promise<ComponentRegistryItem[]> {
  return readAll();
}

export function isValidComponentName(name: string): boolean {
  return /^[a-z][a-z0-9\-]{1,49}$/.test(name);
}

export async function createComponent(input: Omit<ComponentRegistryItem, 'id' | 'created_at' | 'updated_at'>): Promise<ComponentRegistryItem> {
  const items = await readAll();
  if (!isValidComponentName(input.component_name)) {
    throw new Error('Nombre inválido. Debe cumplir ^[a-z][a-z0-9\-]{1,49}$');
  }
  if (items.some(i => i.component_name === input.component_name)) {
    throw new Error('Ya existe un componente con ese nombre');
  }
  const now = new Date().toISOString();
  const created: ComponentRegistryItem = {
    ...input,
    id: nanoid(),
    created_at: now,
    updated_at: now,
  };
  items.push(created);
  await writeAll(items);
  return created;
}

export async function bulkInsertComponents(inputs: Omit<ComponentRegistryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ inserted: number; skipped: number; items: ComponentRegistryItem[]; }>{
  const items = await readAll();
  let inserted = 0;
  for (const inp of inputs) {
    if (!isValidComponentName(inp.component_name)) continue;
    if (items.some(i => i.component_name === inp.component_name)) continue;
    const now = new Date().toISOString();
    items.push({ ...inp, id: nanoid(), created_at: now, updated_at: now });
    inserted++;
  }
  const skipped = inputs.length - inserted;
  await writeAll(items);
  return { inserted, skipped, items };
}

export async function updateComponent(id: string, patch: Partial<Omit<ComponentRegistryItem, 'id' | 'created_at'>>): Promise<ComponentRegistryItem> {
  const items = await readAll();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Componente no encontrado');

  if (patch.component_name && patch.component_name !== items[idx].component_name) {
    if (!isValidComponentName(patch.component_name)) {
      throw new Error('Nombre inválido. Debe cumplir ^[a-z][a-z0-9\-]{1,49}$');
    }
    if (items.some(i => i.component_name === patch.component_name)) {
      throw new Error('Ya existe un componente con ese nombre');
    }
  }

  const next: ComponentRegistryItem = {
    ...items[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  items[idx] = next;
  await writeAll(items);
  return next;
}
