import { NextRequest, NextResponse } from 'next/server';
import { getPageById } from '@/lib/storage';
import { ApiResponse, PageDefinition } from '@/types/page';

// GET /api/pages/id/[id] - Obtener una página por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await getPageById(params.id);
    
    if (!page) {
      const response: ApiResponse<PageDefinition> = {
        success: false,
        error: 'Página no encontrada',
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<PageDefinition> = {
      success: true,
      data: page,
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<PageDefinition> = {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

