import { fetchJson } from '@/lib/http';
import { PageDefinition } from '@/types/page';

// Obtener todas las páginas desde el proxy de Next.js
export async function getPages(): Promise<PageDefinition[]> {
  return fetchJson<PageDefinition[]>('/api/pages');
}

// Obtener una página por ID desde el proxy de Next.js
export async function getPageById(id: string): Promise<PageDefinition | null> {
  return fetchJson<PageDefinition>(`/api/pages/${id}`);
}

// Obtener una página por slug
export async function getPageBySlug(slug: string): Promise<PageDefinition | null> {
  const pages = await getPages();
  return pages.find(page => page.slug === slug) || null;
}

// Crear una nueva página usando el proxy de Next.js
export async function createPage(page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  return fetchJson<PageDefinition>('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
}

// Actualizar una página usando el proxy de Next.js
export async function updatePage(id: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  return fetchJson<PageDefinition>(`/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
}

// Actualizar una página por slug
export async function updatePageBySlug(slug: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageDefinition> {
  const pages = await getPages();
  const index = pages.findIndex(p => p.slug === slug);

  if (index === -1) {
    throw new Error('Página no encontrada');
  }

  const updatedPage: PageDefinition = {
    ...pages[index],
    ...page,
    updatedAt: new Date().toISOString(),
    createdAt: pages[index].createdAt,
  };

  pages[index] = updatedPage;
  await savePages(pages);

  return updatedPage;
}

// Eliminar una página usando el proxy de Next.js
export async function deletePage(id: string): Promise<void> {
  await fetchJson(`/api/pages/${id}`, { method: 'DELETE' });
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

// Guardar todas las páginas
export async function savePages(pages: PageDefinition[]): Promise<void> {
  return fetchJson('/api/pages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pages),
  });
}

