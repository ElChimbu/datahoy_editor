import { PageDefinition } from '@/types/page';
import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { STORAGE_CONFIG } from './config';

// Configuración de almacenamiento
const DATA_DIR = path.join(process.cwd(), STORAGE_CONFIG.dataDir);
const PAGES_FILE = path.join(DATA_DIR, STORAGE_CONFIG.pagesFileName);

// Asegurar que el directorio de datos existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Leer todas las páginas
export async function getPages(): Promise<PageDefinition[]> {
  await ensureDataDir();
  
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, devolver un array vacío
    return [];
  }
}

// Guardar todas las páginas
async function savePages(pages: PageDefinition[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8');
}

// Obtener una página por ID
export async function getPageById(id: string): Promise<PageDefinition | null> {
  const pages = await getPages();
  return pages.find(page => page.id === id) || null;
}

// Obtener una página por slug
export async function getPageBySlug(slug: string): Promise<PageDefinition | null> {
  const pages = await getPages();
  return pages.find(page => page.slug === slug) || null;
}

// Crear una nueva página
export async function createPage(page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  const pages = await getPages();
  
  // Verificar que el slug no esté en uso
  const existingPage = pages.find(p => p.slug === page.slug);
  if (existingPage) {
    throw new Error('Ya existe una página con ese slug');
  }
  
  const newPage: PageDefinition = {
    ...page,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  pages.push(newPage);
  await savePages(pages);
  
  return newPage;
}

// Actualizar una página
export async function updatePage(id: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  const pages = await getPages();
  const index = pages.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Página no encontrada');
  }
  
  // Verificar que el slug no esté en uso por otra página
  const existingPage = pages.find(p => p.slug === page.slug && p.id !== id);
  if (existingPage) {
    throw new Error('Ya existe otra página con ese slug');
  }
  
  const updatedPage: PageDefinition = {
    ...pages[index],
    ...page,
    id,
    updatedAt: new Date().toISOString(),
    // Mantener createdAt original
    createdAt: pages[index].createdAt,
  };
  
  pages[index] = updatedPage;
  await savePages(pages);
  
  return updatedPage;
}

// Actualizar una página por slug
export async function updatePageBySlug(slug: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  const pages = await getPages();
  const index = pages.findIndex(p => p.slug === slug);

  if (index === -1) {
    throw new Error('Página no encontrada');
  }

  // Verificar que el slug no esté en uso por otra página
  const existingPage = pages.find(p => p.slug === page.slug && p.slug !== slug);
  if (existingPage) {
    throw new Error('Ya existe otra página con ese slug');
  }

  const updatedPage: PageDefinition = {
    ...pages[index],
    ...page,
    updatedAt: new Date().toISOString(),
    // Mantener createdAt original
    createdAt: pages[index].createdAt,
  };

  pages[index] = updatedPage;
  await savePages(pages);

  return updatedPage;
}

// Eliminar una página
export async function deletePage(id: string): Promise<void> {
  const pages = await getPages();
  const filteredPages = pages.filter(p => p.id !== id);
  
  if (filteredPages.length === pages.length) {
    throw new Error('Página no encontrada');
  }
  
  await savePages(filteredPages);
}

// Eliminar una página por slug
export async function deletePageBySlug(slug: string): Promise<void> {
  const pages = await getPages();
  const filteredPages = pages.filter(p => p.slug !== slug);

  if (filteredPages.length === pages.length) {
    throw new Error('Página no encontrada');
  }

  await savePages(filteredPages);
}

