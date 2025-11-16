import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/page';
import { ComponentRegistryItem } from '@/types/components';
import { bulkInsertComponents } from '@/lib/componentsStorage';

// POST /api/components/bulk
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = (body?.components || []) as Omit<ComponentRegistryItem, 'id' | 'created_at' | 'updated_at'>[];
    const result = await bulkInsertComponents(items);
    const response: ApiResponse<{ inserted: number; skipped: number; count: number; }>= {
      success: true,
      data: { inserted: result.inserted, skipped: result.skipped, count: result.items.length }
    };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    const response: ApiResponse<null> = { success: false, error: e instanceof Error ? e.message : 'Error desconocido' };
    return NextResponse.json(response, { status: 400 });
  }
}
