import { PageDefinition, ApiResponse } from '@/types/page';
import { fetchJson } from '@/lib/http';

// Normaliza posibles respuestas del backend donde data puede venir anidado
function normalize<T>(resp: any): ApiResponse<T> {
  if (resp && typeof resp === 'object' && 'success' in resp) {
    const raw = (resp as ApiResponse<any>).data as any;
    const unwrapped = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw;
    return { success: resp.success, data: unwrapped, error: resp.error } as ApiResponse<T>;
  }
  // Si el backend no envolvió, asumimos éxito
  return { success: true, data: resp } as ApiResponse<T>;
}

export async function getPages(): Promise<ApiResponse<PageDefinition[]>> {
  const r = await fetchJson<any>('/api/pages');
  return normalize<PageDefinition[]>(r);
}

export async function getPageById(id: string): Promise<ApiResponse<PageDefinition>> {
  const r = await fetchJson<any>(`/api/pages/${id}`);
  return normalize<PageDefinition>(r);
}

export async function createPage(page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  const r = await fetchJson<any>('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
  return normalize<PageDefinition>(r);
}

export async function updatePage(id: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  const r = await fetchJson<any>(`/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
  return normalize<PageDefinition>(r);
}

export async function deletePage(id: string): Promise<ApiResponse<{ message: string }>> {
  const r = await fetchJson<any>(`/api/pages/${id}`, { method: 'DELETE' });
  return normalize<{ message: string }>(r);
}

