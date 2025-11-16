import { PageDefinition, ApiResponse } from '@/types/page';
import { fetchJson } from '@/lib/http';

export async function getPages(): Promise<ApiResponse<PageDefinition[]>> {
  return fetchJson<ApiResponse<PageDefinition[]>>('/api/pages');
}

export async function getPageById(id: string): Promise<ApiResponse<PageDefinition>> {
  return fetchJson<ApiResponse<PageDefinition>>(`/api/pages/${id}`);
}


export async function createPage(page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  return fetchJson<ApiResponse<PageDefinition>>('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
}

export async function updatePage(id: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  return fetchJson<ApiResponse<PageDefinition>>(`/api/pages/${id}` , {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page),
  });
}

export async function deletePage(id: string): Promise<ApiResponse<{ message: string }>> {
  return fetchJson<ApiResponse<{ message: string }>>(`/api/pages/${id}`, { method: 'DELETE' });
}

