import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { updateComponent } from '@/lib/componentsStorage';

// PUT /api/components/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await updateComponent(params.id, body);
    const response: ApiResponse<ComponentRegistryItem> = { success: true, data: updated };
    return NextResponse.json(response);
  } catch (e) {
    const response: ApiResponse<ComponentRegistryItem> = { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    const status = e instanceof Error && e.message.includes('no encontrado') ? 404 : 400;
    return NextResponse.json(response, { status });
  }
}
