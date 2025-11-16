import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { getComponents, createComponent } from '@/lib/componentsStorage';

// GET /api/components
export async function GET() {
  try {
    const data = await getComponents();
    const response: ApiResponse<ComponentRegistryItem[]> = { success: true, data };
    return NextResponse.json(response);
  } catch (e) {
    const response: ApiResponse<ComponentRegistryItem[]> = { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/components
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await createComponent(body);
    const response: ApiResponse<ComponentRegistryItem> = { success: true, data: created };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    const response: ApiResponse<ComponentRegistryItem> = { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    return NextResponse.json(response, { status: 400 });
  }
}
