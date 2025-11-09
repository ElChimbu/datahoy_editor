import { PageDefinition, ApiResponse } from '@/types/page';
import { API_CONFIG } from './config';

// URL de la API
const API_URL = API_CONFIG.url;

export async function getPages(): Promise<ApiResponse<PageDefinition[]>> {
  try {
    const response = await fetch(`${API_URL}/pages`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getPageById(id: string): Promise<ApiResponse<PageDefinition>> {
  try {
    const response = await fetch(`${API_URL}/pages/${id}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}


export async function createPage(page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  try {
    const response = await fetch(`${API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function updatePage(id: string, page: Omit<PageDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageDefinition>> {
  try {
    const response = await fetch(`${API_URL}/pages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function deletePage(id: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch(`${API_URL}/pages/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

