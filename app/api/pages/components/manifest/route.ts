import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';
import { getComponents } from '@/lib/componentsStorage';
import { componentSchemas } from '@/lib/components.registry';

// GET /api/pages/components/manifest
export async function GET() {
  try {
    const registry = await getComponents();
    let names = registry.map(c => c.component_name);
    if (names.length === 0) {
      // Fallback a lista estática (de los tipos soportados por el editor)
      names = componentSchemas.map(s => s.type);
    }
    const response: ApiResponse<string[]> = { success: true, data: names };
    return NextResponse.json(response);
  } catch (e) {
    const response: ApiResponse<string[]> = { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    return NextResponse.json(response, { status: 500 });
  }
}
